import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: 'اظهر',
    aliases: ['فضح', 'كشف', 'فتح'],
    category: 'ق2',
    description: 'كشف وسائط المشاهدة لمرة واحدة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;

            // 1. الوصول للرسالة التي قمت بالرد عليها
            const quotedInfo = m.message?.extendedTextMessage?.contextInfo;
            const quotedMsg = quotedInfo?.quotedMessage;

            if (!quotedMsg) {
                return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على رسالة "مشاهدة لمرة واحدة".' }, { quoted: m });
            }

            // 2. استخراج محتوى المشاهدة لمرة واحدة (يدوياً)
            const viewOnce = quotedMsg.viewOnceMessageV2?.message || quotedMsg.viewOnceMessage?.message || quotedMsg;
            
            // تحديد النوع (صورة أم فيديو)
            const type = Object.keys(viewOnce)[0]; 
            const media = viewOnce[type];

            // التحقق من أنها فعلاً وسائط (صورة أو فيديو)
            if (!['imageMessage', 'videoMessage'].includes(type)) {
                return sock.sendMessage(chatJid, { text: '❌ | هذه ليست رسالة "مشاهدة لمرة واحدة" صالحة.' }, { quoted: m });
            }

            // 3. تحميل الوسائط يدوياً (لأن نظامك لا يحتوي على m.quoted.download)
            const stream = await downloadContentFromMessage(
                media, 
                type === 'imageMessage' ? 'image' : 'video'
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. التنسيق الفخم الخاص بـ ALPHA X
            const caption = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                            `> *✧────[ \`كاشف الأسرار\` ]────╮*\n` +
                            `> *┤ ✅┊ تم استخراج الوسائط بنجاح*\n` +
                            `> *┤ 👤┊ بواسطة: ${m.pushName}*\n` +
                            `> *┤────────────···*\n` +
                            `> *┤ 🤫┊ لا تحاول إخفاء شيء عني!*\n` +
                            `> *┤────────────···*\n` +
                            `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            // 5. إرسال النتيجة
            if (type === 'imageMessage') {
                await sock.sendMessage(chatJid, { image: buffer, caption: caption }, { quoted: m });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(chatJid, { video: buffer, caption: caption }, { quoted: m });
            }

        } catch (error) {
            console.error("ViewOnce Error:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ أثناء التحميل. قد تكون الرسالة قديمة أو تم فتحها مسبقاً.' });
        }
    }
};
