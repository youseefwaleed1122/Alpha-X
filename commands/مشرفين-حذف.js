export default {
    name: 'حذف',
    aliases: ['delete', 'del'],
    category: 'ق4',
    description: 'حذف رسالة عند الرد عليها',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            const senderJid = m.key?.participant || m.participant || chatJid;

            // ✅ التحقق من صلاحية المشرف
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

            // ✅ التحقق من وجود رسالة مردود عليها
            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo?.stanzaId) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ يرجى الرد على الرسالة المراد حذفها.'
                }, { quoted: m });
            }

            // ✅ حذف الرسالة المردود عليها
            await sock.sendMessage(chatJid, {
                delete: {
                    remoteJid: chatJid,
                    fromMe: false,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                }
            });

            // ✅ حذف رسالة الأمر نفسها
            await sock.sendMessage(chatJid, {
                delete: m.key
            });

        } catch (error) {
            console.error("❌ Delete Command Error:", error);
        }
    }
};
