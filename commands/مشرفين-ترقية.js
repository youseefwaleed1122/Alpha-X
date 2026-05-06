export default {
    name: 'ترقية',
    aliases: ['رفع_ادمن', 'ترقيه', 'promote'],
    category: 'ق4',
    description: 'لرفع عضو إلى رتبة مشرف',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            if (!chatJid.endsWith('@g.us')) return;

            // تحديد الشخص
            let userToPromote = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                                m.message.extendedTextMessage?.contextInfo?.participant;

            if (!userToPromote && args[0]) {
                userToPromote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!userToPromote) {
                return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على رسالة العضو أو عمل منشن له لترقيته.' }, { quoted: m });
            }

            // محاولة التنفيذ فوراً
            try {
                await sock.groupParticipantsUpdate(chatJid, [userToPromote], 'promote');
                
                const promoteText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`ترقية إدارية\` ]────╮*
> *┤ 👤┊ العضو:* @${userToPromote.split('@')[0]}
> *┤ ✨┊ الرتبة: مشرف (Admin)*
> *┤ 👮‍♂️┊ بواسطة: ${m.pushName}*
> *┤────────────···*
> *✧────[ \`النتيجة\` ]────╮*
> *┤ ✅┊ تم إضافة مشرف جديد بنجاح ✔️*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

                await sock.sendMessage(chatJid, { text: promoteText, mentions: [userToPromote] }, { quoted: m });

            } catch (err) {
                // إذا فشل البوت في التنفيذ
                return sock.sendMessage(chatJid, { text: '❌ | فشل الأمر، تأكد من أنني مشرف في هذه المجموعة.' }, { quoted: m });
            }

        } catch (error) {
            console.error(error);
        }
    }
};
