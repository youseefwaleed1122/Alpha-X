export default {
    name: 'المتصلين',
    aliases: ['اونلاين', 'online'],
    category: 'ق2',
    description: 'عرض الأشخاص النشطين مؤخراً في المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;

            if (!chatJid.endsWith('@g.us')) {
                return sock.sendMessage(chatJid, { text: '⚠️ | هذا الأمر للمجموعات فقط.' }, { quoted: m });
            }

            // محاولة جلب المشاركين الذين لديهم رسائل في الذاكرة
            // ملاحظة: هذا يعتمد على الرسائل التي استقبلها البوت منذ تشغيله
            const store = ctx.store; // إذا كان لديك store في الـ context
            let messages = [];
            
            if (store && store.messages[chatJid]) {
                messages = Object.values(store.messages[chatJid]);
            } else {
                // إذا لم يوجد store، سنكتفي بمنشن النشطين في قاعدة بياناتك (db)
                // أو نعتمد على من أرسل رسائل في الجلسة الحالية
                return sock.sendMessage(chatJid, { text: '⚠️ | نظام الذاكرة المؤقتة لا يسجل متصلين حالياً، سأقوم بعمل منشن عام بدلاً من ذلك.' }, { quoted: m });
            }

            // استخراج المشاركين الفريدين من الرسائل الأخيرة
            const uniqueOnline = messages
                .map(msg => msg.key.participant || msg.participant)
                .filter((v, i, a) => v && a.indexOf(v) === i);

            if (uniqueOnline.length === 0) {
                return sock.sendMessage(chatJid, { text: '📍 | لم يتم رصد أي نشاط مؤخراً في هذه المجموعة.' }, { quoted: m });
            }

            // ترتيب القائمة
            const sortedOnline = uniqueOnline.sort((a, b) => a.split('@')[0].localeCompare(b.split('@')[0]));

            let list = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                       `> *✧────[ \`المتصلين الآن\` ]────╮*\n` +
                       `> *┤ 🌐┊ نشطين مؤخراً: ${sortedOnline.length}*\n` +
                       `> *┤────────────···*\n\n`;

            sortedOnline.forEach((jid, i) => {
                list += `> *${i + 1}.* @${jid.split('@')[0]}\n`;
            });

            list += `\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { react: { text: '🌐', key: m.key } });
            await sock.sendMessage(chatJid, { 
                text: list, 
                mentions: sortedOnline 
            }, { quoted: m });

        } catch (error) {
            console.error("Online Error:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ أثناء رصد المتصلين.' });
        }
    }
};
