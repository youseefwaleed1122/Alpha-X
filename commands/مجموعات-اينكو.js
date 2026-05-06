import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';

export default {
    name: 'تغيير',
    aliases: ['الضبط', 'اعدادات', 'group'],
    category: 'ق6',
    description: 'تغيير اسم أو وصف أو صورة المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            if (!chatJid.endsWith('@g.us')) return;

            // 1. التحقق من صلاحيات المرسل (مشرف أو مطور)
            const groupMetadata = await sock.groupMetadata(chatJid);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
            const senderJid = m.key.participant || m.participant || chatJid;
            const isOwner = senderJid === ctx.cfg.ownerNumber || ctx.cfg.eliteNumbers.includes(senderJid);
            const isSenderAdmin = admins.includes(senderJid);

            if (!isSenderAdmin && !isOwner) {
                return sock.sendMessage(chatJid, { text: '🚫 | هذا الأمر خاص بالمشرفين فقط.' }, { quoted: m });
            }

            const option = (args[0] || '').toLowerCase();
            
            // رسالة المساعدة في حال لم يتم اختيار خيار صحيح
            if (!['صورة', 'اسم', 'وصف'].includes(option)) {
                const helpText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                    `> *✧───[ \`الاستخدام الصحيح\` ]───╮*\n` +
                    `> *┤ 🖼️┊ .تغيير صورة (رد على صورة)*\n` +
                    `> *┤ 📝┊ .تغيير اسم (الاسم الجديد)*\n` +
                    `> *┤ 🗒️┊ .تغيير وصف (الوصف الجديد)*\n` +
                    `> *┤────────────···*\n` +
                    `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;
                return sock.sendMessage(chatJid, { text: helpText }, { quoted: m });
            }

            /* ───────── تغيير الصورة ───────── */
            if (option === 'صورة') {
                const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mime = quoted?.imageMessage?.mimetype || m.message?.imageMessage?.mimetype || '';

                if (!/image/.test(mime)) {
                    return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على صورة لتغيير صورة المجموعة.' }, { quoted: m });
                }

                try {
                    // تحميل الصورة ومعالجتها بـ Jimp
                    const buffer = await ctx.systems.get('downloadMedia')(m); // بافتراض وجود نظام تحميل
                    const imgPath = `./temp_group_${Date.now()}.jpg`;
                    const image = await Jimp.read(buffer);
                    await image.writeAsync(imgPath);

                    await sock.updateProfilePicture(chatJid, { url: imgPath });
                    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

                    return sock.sendMessage(chatJid, { text: '✅ | تم تحديث صورة المجموعة بنجاح.' }, { quoted: m });
                } catch (err) {
                    return sock.sendMessage(chatJid, { text: '❌ | فشل تغيير الصورة، تأكد من أنني مشرف.' }, { quoted: m });
                }
            }

            /* ───────── تغيير الاسم ───────── */
            if (option === 'اسم') {
                const newName = args.slice(1).join(' ') || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
                if (!newName) return sock.sendMessage(chatJid, { text: '⚠️ | اكتب الاسم الجديد بعد الأمر.' }, { quoted: m });

                try {
                    await sock.groupUpdateSubject(chatJid, newName);
                    return sock.sendMessage(chatJid, { text: `✅ | تم تغيير اسم المجموعة إلى:\n*『 ${newName} 』*` }, { quoted: m });
                } catch (err) {
                    return sock.sendMessage(chatJid, { text: '❌ | فشل تغيير الاسم، تأكد من صلاحياتي.' }, { quoted: m });
                }
            }

            /* ───────── تغيير الوصف ───────── */
            if (option === 'وصف') {
                const newDesc = args.slice(1).join(' ') || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
                if (!newDesc) return sock.sendMessage(chatJid, { text: '⚠️ | اكتب الوصف الجديد بعد الأمر.' }, { quoted: m });

                try {
                    await sock.groupUpdateDescription(chatJid, newDesc);
                    return sock.sendMessage(chatJid, { text: '✅ | تم تحديث وصف المجموعة بنجاح.' }, { quoted: m });
                } catch (err) {
                    return sock.sendMessage(chatJid, { text: '❌ | فشل تحديث الوصف.' }, { quoted: m });
                }
            }

        } catch (error) {
            console.error("Error in Group Settings:", error);
        }
    }
};
