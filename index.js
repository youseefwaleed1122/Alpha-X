// ────────────────[البداية]────────────────
import Auth, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from '@whiskeysockets/baileys';
import cfonts from 'cfonts';
const { say } = cfonts;
import chalk from 'chalk';
import pino from 'pino';
import fs from 'fs';
import boxen from 'boxen';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// ────────────────[المحركات]────────────────
import cfg from './config.js';
import main from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────[مساعد الإقتران]────────────────
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => { rl.close(); resolve(ans); }));
};

// ────────────────[عرض شعار البوت]────────────────
say(cfg.botLogo || 'ALPHA X', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'blue'],
    space: true,
});

async function Go() {
    const { state, saveCreds } = await useMultiFileAuthState(cfg.sessionPath);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = Auth.default({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        syncFullHistory: false,
    });

  // ────────────────[اعدادات كود الإقتران]────────────────
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question(chalk.blueBright('Your Number Phone: '));
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(
            boxen(chalk.magentaBright(`Your Pairing Code: ${code}`), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'magenta',
                backgroundColor: '#1a1a1a'
            })
        );
    }

 // ────────────────[الجلسة تحديث]────────────────
    sock.ev.on('creds.update', saveCreds);

    // ────────────────[الربط الموحد]────────────────

    // 1. استقبال الرسائل النصية
sock.ev.on('messages.upsert', (data) => {
    main.handler(sock, data, { cfg });
});

// 2. كاشف حركة الأعضاء (ترقية/إعفاء/دخول/خروج)
sock.ev.on('group-participants.update', (data) => {
    main.handler(sock, { ...data, isGroupUpdate: true }, { cfg });
});

// 3. كاشف إعدادات المجموعة (اسم/وصف/صورة/قفل)
sock.ev.on('groups.update', ([data]) => {
    main.handler(sock, { ...data, isGroupUpdate: true }, { cfg });
});


   // ────────────────[اعداد حالة الاتصال]────────────────
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const again = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (again) {
                console.log(chalk.yellow('⚠️  Connection lost. Reconnecting...'));
                Go();
            } else {
                console.log(chalk.red('❌ Session Expired. Please login again.'));
            }
        } else if (connection === 'open') {
            console.log(
                chalk.bold.cyan('\n ✨  WELCOME TO BOT ALPHA X  ✨ \n') +
                chalk.gray(' ──────────────────────────────────\n') +
                chalk.green('  ● ') + chalk.white('Status: ') + chalk.greenBright('Online\n') +
                chalk.green('  ● ') + chalk.white('Mode  : ') + chalk.whiteBright('Public\n')
            );
        }
    });
}

// ────────────────[بدأ التشغيل]────────────────
Go().catch(e => console.error(chalk.redBright('致命的なエラー (Fatal Error):'), e));

// ────────────────[𝒜𝒴𝒪𝒰ℬ]────────────────