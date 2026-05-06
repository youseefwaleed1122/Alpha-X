import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- الكاش (تحميل الصورة مرة واحدة عند تشغيل البوت لضمان السرعة) ---
const menuImgPath = path.join(__dirname, '../src/media/menu.png');
let cachedImage = null;
try {
    if (fs.existsSync(menuImgPath)) cachedImage = fs.readFileSync(menuImgPath);
} catch (e) { }

export default {
    name: 'menu',
    aliases: ['الاوامر', 'أوامر', 'اوامر'],
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            const senderJid = m.key.participant || chatJid;
            const senderNumber = senderJid.split('@')[0];

            // 🚀 إضافة التفاعل التلقائي بمجرد طلب الأمر
            await sock.sendMessage(chatJid, { 
                react: { text: "🚀", key: m.key } 
            });

            const { metadata, db } = ctx;

            // --- حساب الوقت واليوم بسرعة فائقة ---
            const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const now = new Date();
            const dayName = days[now.getDay()];
            const dateStr = metadata?.date || now.toLocaleDateString('ar-EG');
            
            const uptime = process.uptime();
            const uptimeStr = `${Math.floor(uptime / 3600)}:${Math.floor((uptime % 3600) / 60)}:${Math.floor(uptime % 60)}`;

            const readMore = String.fromCharCode(8206).repeat(4001);

            const menuText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━
> *┤────────────···*
> *┤ مرحبا بك @${senderNumber} 👋*
> *┤────────────···*
> *✧──[ معلومات الـبـوت ]──╮*
> *┤ 🤖┊الإسم: 𝐀𝐋𝐏𝐇𝐀 𝐗*
> *┤ ⚙️┊الإصدار: 1.0v*
> *┤ 🖲┊ البادئة: .*
> *┤ ♦┊ المهنة : إدارة*
> *┤ 🌐┊الموقع الإلكتروني:*
> https://kornos.online
> *┤────────────···*
> *✧────[ الـوقـت ]────╮*
> *┤ 📆┊التاريخ: ${dateStr}*
> *┤ 🗓┊اليوم: ${dayName}*
> *┤ 🚀┊ النشاط: ${uptimeStr}*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
\`لعرض الأوامر إضغط على مزيد\`
${readMore}
> *✧────[ الأوامر ]────╮*
> *┤────────────···*
> *┤🎭┊ \`.ق1\`:*
> *┤ قسم الشخصيات*
> *┤🧰┊ \`.ق2\`:*
> *┤ قسم الأدوات*
> *┤🧑‍💻┊ \`.ق3\`:*
> *┤ قسم المطور*
> *┤🧾┊ \`.ق4\`:*
> *┤ قسم المشرفين*
> *┤☪️┊ \`.ق5\`:*
> *┤ قسم الدين*
> *┤👥┊ \`.ق6\`:*
> *┤ قسم الجروبات*
> *┤🎮┊ \`.ق7\`:*
> *┤ قسم الألعاب*
> *┤🖼️┊ \`.ق8\`:*
> *┤ قسم الصور*
> *┤🏦┊ \`.ق9\`:*
> *┤ قسم البنك*
> *┤⬇️┊ \`.ق10\`:*
> *┤ قسم الميديا*
> *┤🛡️┊ \`.ق11\`:*
> *┤ قسم الحماية*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            const payload = cachedImage 
                ? { image: cachedImage, caption: menuText, mentions: [senderJid] }
                : { text: menuText, mentions: [senderJid] };

            await sock.sendMessage(chatJid, payload, { quoted: m });
            return true;

        } catch (error) {
            console.error("❌ Error in Menu Command:", error);
        }
    }
};
