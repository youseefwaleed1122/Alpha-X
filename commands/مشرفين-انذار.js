export default {
    name: 'انذار',
    aliases: ['warn'],
    category: 'ق4',
    description: 'إنذار عضو في المجموعة',
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
                    text: '⚠️ يرجى الرد على رسالة الشخص المراد إنذاره.'
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
                    text: '⚠️ لا يمكن إنذار المشرفين.'
                }, { quoted: m });
            }

            // ✅ إضافة الإنذار
            const user = db.data.users[targetKey];
            user.warn = (user.warn || 0) + 1;
            db.save();

            // ✅ طرد عند 3 إنذارات
            if (user.warn >= 3) {
                await sock.sendMessage(chatJid, {
                    text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *🚨 تم طرد @${targetKey.split('@')[0]}*\n> *┤ 👤 المستخدم: ${user.name || targetName}*\n> *┤ ⚠️ السبب: وصل لـ 3 إنذارات*\n> *┤────────────···*\n> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                    mentions: [targetKey]
                }, { quoted: m });

                await sock.groupParticipantsUpdate(chatJid, [targetKey], 'remove');
                user.warn = 0;
                db.save();
                return;
            }

            // ✅ رسالة الإنذار
            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *⚠️ إنذار @${targetKey.split('@')[0]}*\n> *┤ 👤 المستخدم: ${user.name || targetName}*\n> *┤ 📊 الإنذارات: ${user.warn}/3*\n> *┤ ⚠️ عند الإنذار الثالث سيتم طردك*\n> *┤────────────···*\n> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                mentions: [targetKey]
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Warn Command Error:", error);
        }
    }
};
