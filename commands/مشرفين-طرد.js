export default {
    name: 'طرد',
    aliases: ['طرد', 'كرش', 'kick'],
    category: 'ق4',
    description: 'لطرد عضو من المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            const isGroup = chatJid.endsWith('@g.us');

            // 1. التحقق من أن الأمر مستخدم في مجموعة
            if (!isGroup) return;

            // 2. التحقق من الصلاحيات (المشرفين والمطورين فقط)
            const groupMetadata = await sock.groupMetadata(chatJid);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin).map(p => p.id);
            
            const senderJid = m.key.participant || m.participant || chatJid;
            const isOwner = senderJid === ctx.cfg.ownerNumber || ctx.cfg.eliteNumbers.includes(senderJid);
            const isSenderAdmin = admins.includes(senderJid);

            if (!isSenderAdmin && !isOwner) {
                return sock.sendMessage(chatJid, { text: '🚫 | هذا الأمر خاص بالمشرفين فقط.' }, { quoted: m });
            }

            // 3. التحقق هل البوت مشرف ليتمكن من الطرد
            const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
            if (!isBotAdmin) {
                return sock.sendMessage(chatJid, { text: '❌ | يجب أن أكون مشرفاً لأتمكن من طرد الأعضاء.' }, { quoted: m });
            }

            // 4. تحديد الشخص المراد طرده (عن طريق الرد أو المنشن)
            let userToKick = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             m.message.extendedTextMessage?.contextInfo?.participant;

            if (!userToKick && args[0]) {
                userToKick = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!userToKick) {
                return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على رسالة العضو أو عمل منشن له لطره.' }, { quoted: m });
            }

            // 5. منع طرد المشرفين أو المطور أو البوت نفسه
            if (admins.includes(userToKick)) {
                return sock.sendMessage(chatJid, { text: '❌ | لا يمكنني طرد مشرف آخر.' }, { quoted: m });
            }
            if (userToKick === ctx.cfg.ownerNumber) {
                return sock.sendMessage(chatJid, { text: '💀 | هل تريدني حقاً أن أطرد المطور؟ لا أستطيع!' }, { quoted: m });
            }

            // 6. تنفيذ الطرد وإرسال الرسالة بتنسيقك الخاص
            await sock.groupParticipantsUpdate(chatJid, [userToKick], 'remove');

            const kickText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`إجراء إداري\` ]────╮*
> *┤ 👤┊ العضو: @${userToKick.split('@')[0]}*
> *┤ 🚫┊ الإجراء: طرد من المجموعة*
> *┤ 👮‍♂️┊ بواسطة: ${m.pushName}*
> *┤────────────···*
> *✧────[ \`النتيجة\` ]────╮*
> *┤ 🗑️┊ تم تنظيف المجموعة بنجاح ✔️*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { 
                text: kickText, 
                mentions: [userToKick, senderJid] 
            }, { quoted: m });

            return true;
        } catch (error) {
            console.error("❌ Error in Kick Command:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ حدث خطأ أثناء محاولة الطرد.' });
        }
    }
};
