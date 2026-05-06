export default {
    name: 'خفض',
    aliases: ['تنزيل', 'اعفاء', 'demote'],
    category: 'ق4',
    description: 'لتنزيل مشرف إلى رتبة عضو',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            if (!chatJid.endsWith('@g.us')) return;

            let userToDemote = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                               m.message.extendedTextMessage?.contextInfo?.participant;

            if (!userToDemote && args[0]) {
                userToDemote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!userToDemote) {
                return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على رسالة المشرف أو عمل منشن له لتنزيله.' }, { quoted: m });
            }

            // محاولة التنفيذ فوراً
            try {
                await sock.groupParticipantsUpdate(chatJid, [userToDemote], 'demote');

                const demoteText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`تنزيل إداري\` ]────╮*
> *┤ 👤┊ العضو:* @${userToDemote.split('@')[0]}
> *┤ 📉┊ الرتبة: عضو عادى*
> *┤ 👮‍♂️┊ بواسطة: ${m.pushName}*
> *┤────────────···*
> *✧────[ \`النتيجة\` ]────╮*
> *┤ ⚠️┊ تم سحب صلاحيات الإشراف بنجاح*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

                await sock.sendMessage(chatJid, { text: demoteText, mentions: [userToDemote] }, { quoted: m });

            } catch (err) {
                // إذا فشل البوت في التنفيذ
                return sock.sendMessage(chatJid, { text: '❌ | فشل الأمر، تأكد من أنني مشرف في هذه المجموعة.' }, { quoted: m });
            }

        } catch (error) {
            console.error(error);
        }
    }
};
