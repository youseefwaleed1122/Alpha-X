export default {
    name: 'بريميوم',
    aliases: ['premium'],
    category: 'ق3',
    description: 'تفعيل أو إلغاء البريميوم لمستخدم',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;
            const senderJid = m.key?.participant || m.participant || chatJid;

            // ✅ التحقق من صلاحية المطور
            const isOwner = ctx.cfg.ownerNumber === senderJid || ctx.cfg.eliteNumbers.includes(senderJid);
            if (!isOwner) {
                return await sock.sendMessage(chatJid, {
                    text: '⛔ هذا الأمر مخصص للمطور فقط.'
                }, { quoted: m });
            }

            const contextInfo = m.message?.extendedTextMessage?.contextInfo;
            const targetName = contextInfo?.quotedMessage?.pushName;
            const targetParticipant = contextInfo?.participant;

            if (!contextInfo || (!targetName && !targetParticipant)) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ يرجى الرد على رسالة الشخص.'
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

            const user = db.data.users[targetKey];

            // ✅ toggle البريميوم
            user.premium = !user.premium;
            db.save();

            const statusEmoji = user.premium ? '👑' : '❌';
            const statusWord = user.premium ? 'تفعيل' : 'إلغاء';

            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *${statusEmoji} تم ${statusWord} البريميوم بنجاح*\n> *┤ 👤 المستخدم: ${user.name || targetName}*\n> *┤ 📌 الحالة: ${user.premium ? 'بريميوم 👑' : 'عادي 👤'}*\n> *┤────────────···*\n> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                mentions: [targetKey]
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Premium Command Error:", error);
        }
    }
};
