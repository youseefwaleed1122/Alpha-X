//────────────────[المكتبات الأساسية]────────────────
import pino from 'pino';
import chalk from 'chalk';
import moment from 'moment-timezone';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import db, { loadDatabase } from './lib/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ────────────────[تحميل قاعدة البيانات]────────────────
await loadDatabase();

export const commandsCache = { cmds: new Map(), als: new Map() };
export const systems = new Map();

// ────────────────[دالة التحميل التلقائي للملفات]────────────────
const loadFiles = async (folder, map, label) => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) return;
    map.clear();
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    for (const f of files) {
        try {
            const url = `file://${path.join(dir, f)}?upd=${Date.now()}`;
            const { default: content } = await import(url);
            if (folder === 'commands' && content?.name) {
                commandsCache.cmds.set(content.name, content);
                content.aliases?.forEach(a => commandsCache.als.set(a, content.name));
            } else if (folder === 'lib' && typeof content === 'function') {
                map.set(f, content);
            }
        } catch (e) { console.log(chalk.red(`❌ Error in ${label} [${f}]:`), e.message); }
    }
    console.log(chalk.cyan(`🔄 [RELOAD] ${label} synchronized.`));
};

chokidar.watch([path.join(__dirname, 'commands'), path.join(__dirname, 'lib')], { ignoreInitial: true }).on('all', () => {
    setTimeout(() => { loadFiles('commands', commandsCache.cmds, 'Commands'); loadFiles('lib', systems, 'Systems'); }, 100);
});

await loadFiles('commands', commandsCache.cmds, 'Commands');
await loadFiles('lib', systems, 'Systems');

// ────────────────[الميديل وير]────────────────
export const pre = [
    async (m, { cfg }) => {
        try {
            if (m.isGroupUpdate || m.messageStubType) return true; // تخطي الميدل وير للأحداث ورسائل النظام

            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            if (!text || typeof text !== 'string') return true;
// ────────────────[بادئات الأوامر]────────────────
            const prefix = ['.', '!', '#'];
            const isCommand = prefix.some(p => text.startsWith(p));
// ────────────────[رسالة الكونسول]────────────────
            if (isCommand) {
                const jid = m.key?.remoteJid || 'unknown';
                const senderName = m.pushName || 'Unknown User';
                const time = moment().tz('Africa/Ndjamena').format('YYYY-MM-DD HH:mm:ss');
                console.log(chalk.magentaBright(`\n╭─── [ ALPHA X LOG ] ───`));
                console.log(chalk.cyan(`│ 📥 Command Detected`));
                console.log(chalk.yellow(`│ 👤 From: ${jid}`));
                console.log(chalk.blue(`│ 📝 Name: ${senderName}`));
                console.log(chalk.green(`│ ⏰ Time: ${time}`));
                console.log(chalk.white(`│ 💬 Text: ${text}`));
                console.log(chalk.magenta(`╰──────────────────────────────\n`));
            }
            return true;
        } catch (err) {
            console.log(chalk.red('[ PRE ERROR ]'), err.message);
            return true;
        }
    }
];

export const handler = async (sock, data, { cfg }) => {
    try {
        let m;
        // التحقق مما إذا كان الحدث قادماً من مستشعرات المجموعة في index.js
        if (data.isGroupUpdate) {
            m = data; 
        } else {
            m = data.messages && data.messages[0];
        }

        // ────────────────[فلتر الرسائل]────────────────
        // نسمح بمرور: الرسائل العادية، تحديثات المجموعة (الكاشف)، ورسائل النظام (StubType)
        const isStub = !!m?.messageStubType;
        const isGroupUpdate = !!m?.isGroupUpdate;
        
        if (!m || (!m.message && !isGroupUpdate && !isStub) || (m.key && m.key.fromMe)) return;

        // تحديد معرف المجموعة (دعم id للأحداث و remoteJid للرسائل)
        const chatJid = isGroupUpdate ? (m.id || m.jid) : m.key.remoteJid;
        
        // تحديد من قام بالفعل (المؤلف في الأحداث أو المرسل في الرسائل)
        const senderJid = isGroupUpdate ? 
            (m.author || m.participants?.[0] || chatJid) : 
            (m.key?.participant || m.participant || chatJid);


        // ────────────────[تهيئة البيانات]────────────────
        
        // تهيئة بيانات المستخدم (تتم فقط في حالة الرسائل العادية وليس الأحداث أو طلبات النظام)
        if (!m.isGroupUpdate && !isStub && senderJid) {
    if (typeof db.data.users[senderJid] !== 'object') db.data.users[senderJid] = {};
    const user = db.data.users[senderJid];
    user.name = m.pushName || user.name || 'User';

    if (!('exp' in user)) user.exp = 0;
    if (!('level' in user)) user.level = 0;
    if (!('coin' in user)) user.coin = 0;
    if (!('banned' in user)) user.banned = false;
    if (!('premium' in user)) user.premium = false;
    if (!('marry' in user)) user.marry = '';
    if (!('bank' in user)) user.bank = 0;
    if (!('warn' in user)) user.warn = 0;
    if (!('role' in user)) user.role = 'E';
    if (!('muto' in user)) user.muto = false;
    if (!('commands' in user)) user.commands = 0;
}

        // تهيئة بيانات المجموعة (تعمل مع الرسائل والأحداث)
        if (chatJid && chatJid.endsWith('@g.us')) {
            if (typeof db.data.chats[chatJid] !== 'object') db.data.chats[chatJid] = {};
            const chat = db.data.chats[chatJid];
            if (!('autolevel' in chat)) chat.autolevel = false;
            if (!('welcome' in chat)) chat.welcome = false;
            if (!('aceptar' in chat)) chat.aceptar = false;
            if (!('detect' in chat)) chat.detect = false;
            if (!('react' in chat)) chat.react = false;
            //الحماية
            if (!('antilink' in chat)) chat.antilink = false;
            if (!('antifake' in chat)) chat.antifake = false;
            if (!('antispam' in chat)) chat.antispam = false;
            if (!('antiswear' in chat)) chat.antiswear = false;
        }
       

        // 3. تهيئة إعدادات البوت العامة (Global Settings)
        if (typeof db.data.settings !== 'object') db.data.settings = {};
        const globalSettings = db.data.settings;
        if (!('botName' in globalSettings)) globalSettings.botName = cfg.botName;
        if (!('private' in globalSettings)) globalSettings.private = false;
        if (!('responses' in globalSettings)) globalSettings.responses = true;
        if (!('mode' in globalSettings)) globalSettings.mode = 'public';

        db.save(); 

        const ctx = { sock, cfg, db, cmds: commandsCache.cmds, als: commandsCache.als, systems };

                // --- 2. تشغيل الأنظمة التلقائية (مثل automatic.js) ---
        for (const [name, sys] of systems) { 
            const result = await sys(sock, m, ctx).catch(console.error); 
            // إذا قام نظام الكتم بالحذف وأرسل (return true) نتوقف فوراً
            if (result === true) return; 
        }


        // إذا كان حدث مجموعة أو رسالة نظام، نتوقف هنا
        if (m.isGroupUpdate || isStub) return;

        // --- 3. معالجة الأوامر (تكملة كودك الأصلي) ---
        const txt = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const prefix = ['.', '!', '#', '/'].find(p => txt.startsWith(p));
        if (!prefix) return;

        const args = txt.slice(prefix.length).trim().split(/\s+/);
        const cmdName = args.shift().toLowerCase();
        const key = commandsCache.cmds.has(cmdName) ? cmdName : commandsCache.als.get(cmdName);

        if (key) {
            const command = commandsCache.cmds.get(key);
            for (const fn of pre) { 
                if (!(await fn(m, ctx))) return; 
            }
            await command.execute(sock, m, args, { ...ctx, command });
            db.data.users[senderJid].commands += 1;
            db.save(); 
        }
    } catch (e) { 
        console.log(chalk.red(`❌ Handler Error:`), e.message); 
    }
};
// ────────────────[النهاية]────────────────
export default { handler };

// ────────────────[𝒜𝒴𝒪𝒰ℬ]────────────────