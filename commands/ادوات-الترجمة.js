import translate from '@vitalets/google-translate-api';

export default {
    name: 'ترجمة',
    aliases: ['ترجم', 'trans', 'tr'],
    category: 'ق2',
    description: 'ترجمة النصوص إلى أي لغة (الافتراضية: العربية)',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            
            // 1. تحديد النص المراد ترجمته (إما نص الأمر أو الرد على رسالة)
            let text = args.join(' ');
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quoted) {
                text = quoted.conversation || quoted.extendedTextMessage?.text || text;
            }

            if (!text) {
                return sock.sendMessage(chatJid, { 
                    text: `⚠️ | يرجى كتابة النص أو الرد على رسالة لترجمتها.\nمثال: ${ctx.cfg.prefix}ترجمة Hello` 
                }, { quoted: m });
            }

            // 2. تحديد اللغة (إذا وضع المستخدم رمز لغة مثل "en" أولاً، نترجم إليها)
            let lang = 'ar'; // اللغة الافتراضية
            if (args[0] && args[0].length === 2) {
                lang = args[0];
                text = args.slice(1).join(' ');
            }

            // 3. عملية الترجمة
            const result = await translate(text, { to: lang });

            // 4. التنسيق النهائي بلمسة ALPHA X
            const translationText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                                    `> *✧────[ \`المترجم الذكي\` ]────╮*\n` +
                                    `> *┤ 🌐┊ من: ${result.from.language.iso.toUpperCase()}*\n` +
                                    `> *┤ 🎯┊ إلى: ${lang.toUpperCase()}*\n` +
                                    `> *┤────────────···*\n` +
                                    `> *📖┊ النص الأصلي:*\n` +
                                    `> ${text}\n\n` +
                                    `> *✨┊ الترجمة:*\n` +
                                    `> ${result.text}\n` +
                                    `> *┤────────────···*\n` +
                                    `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { text: translationText }, { quoted: m });

        } catch (error) {
            console.error("Translation Error:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ أثناء الترجمة. تأكد من جودة اتصال الإنترنت.' });
        }
    }
};
