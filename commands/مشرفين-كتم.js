export default {
    name: 'كتم',
    aliases: ['mute'],
    category: 'ق4',
    description: 'كتم عضو في المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;
            const senderJid = m.key?.participant || m.participant || chatJid;

            if (!chatJid.endsWith('@g.us')) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ هذا الأمر مخصص للمجموعات فقط.'
                }, { quoted: m });
            }

            const groupMetadata = await sock.groupMetadata(chatJid).catch(() => ({ participants: [] }));
            const participants = groupMetadata.participants || [];
            const senderInGroup = participants.find(p => p.id === senderJid);
            const isSenderAdmin = senderInGroup?.admin === 'admin' || senderInGroup?.admin === 'superadmin';
            const isOwner = ctx.cfg.ownerNumber === senderJid || ctx.cfg.eliteNumbers.includes(senderJid);

            if (!isSenderAdmin && !isOwner) {
                return await sock.sendMessage(chatJid, {
                    text: '⛔ هذا الأمر مخصص للمشرفين فقط.'
                }, { quoted: m });
            }

            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            const targetName = contextInfo?.quotedMessage?.pushName;
            const targetParticipant = contextInfo?.participant;

            if (!contextInfo || (!targetName && !targetParticipant)) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ يرجى الرد على رسالة الشخص المراد كتمه.'
                }, { quoted: m });
            }

            let targetKey = targetName
                ? Object.keys(db.data.users).find(key =>
                    key.includes('@s.whatsapp.net') &&
                    db.data.users[key].name === targetName)
                : null;

            if (!targetKey && targetParticipant?.includes('@s.whatsapp.net')) {
                targetKey = targetParticipant;
            }

            if (!targetKey) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ لم يتم العثور على المستخدم في قاعدة البيانات.'
                }, { quoted: m });
            }

            const targetInGroup = participants.find(p => p.id === targetKey);
            const isTargetAdmin = targetInGroup?.admin === 'admin' || targetInGroup?.admin === 'superadmin';

            if (isTargetAdmin && !isOwner) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ لا يمكن كتم المشرفين.'
                }, { quoted: m });
            }

            db.data.users[targetKey].muto = true;
            db.save();

            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐌𝐔𝐓𝐄~ 〕⌬ ╄╾ ━\n\n> *🔇 تم الكتم بنجاح*\n> *┤ 👤 المستخدم: ${db.data.users[targetKey].name || targetName}*\n> *┤ 🚫 الحالة: ممنوع من التحدث*\n> *┤────────────···*\n> *⚠️ سيتم حذف رسائله تلقائياً.*\n> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                mentions: [targetKey]
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Mute Command Error:", error);
        }
    }
};