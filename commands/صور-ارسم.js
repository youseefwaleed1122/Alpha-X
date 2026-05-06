export default {
    name: 'ارسم',
    aliases: [],
    tags: ['tools', 'ai'],
    help: ['ارسم <وصف>'],
    description: 'انشأ رسومات بالذكاء الاصطناعي',
    category: 'ق8',

    execute: async (sock, m, args, { cfg }) => {
        try {
            const prompt = args.join(' ').trim();

            if (!prompt) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: '❌ أرسل النص بعد الأمر.\n\nمثال:\n.ارسم غوكو يقاتل في الفضاء'
                }, { quoted: m });
            }

            // 🎨 تحويل الطلب إلى ستايل رسم
            const artPrompt = `${prompt}, black and white pencil sketch, line art, anime drawing, no colors`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(artPrompt)}`;

            const caption = `
*❐═━━━═╊⊰🖼️⊱╉═━━━═❐*

✏️ *الوصف:* ${prompt}
🎨 *النمط:* رسمة أبيض وأسود

*❐═━━━═╊⊰🖼️⊱╉═━━━═❐*
> *${cfg.botName || 'BOT'}*
            `.trim();

            // 🎯 رياكشن قبل التنفيذ
            try {
                await sock.sendMessage(m.key.remoteJid, {
                    react: { text: '🎨', key: m.key }
                });
            } catch {}

            // 📤 إرسال الصورة
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: imageUrl },
                caption
            }, { quoted: m });

            // ✅ رياكشن نجاح
            try {
                await sock.sendMessage(m.key.remoteJid, {
                    react: { text: '✅', key: m.key }
                });
            } catch {}

        } catch (e) {
            console.log('❌ Error in draw command:', e);
            await sock.sendMessage(m.key.remoteJid, {
                text: '❌ حدث خطأ أثناء إنشاء الرسمة.'
            }, { quoted: m });
        }
    }
};
