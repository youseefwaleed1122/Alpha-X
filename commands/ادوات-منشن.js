export default {
    name: 'منشن',
    aliases: ['تاق', 'الجميع', 'نداء'],
    category: 'ق2',
    description: 'عمل منشن لجميع أعضاء المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;

            // 1. التحقق من أن الأمر داخل مجموعة
            if (!chatJid.endsWith('@g.us')) {
                return sock.sendMessage(chatJid, { text: '⚠️ | هذا الأمر يعمل داخل المجموعات فقط.' }, { quoted: m });
            }

            // 2. جلب معلومات المجموعة والأعضاء
            const groupMetadata = await sock.groupMetadata(chatJid);
            const participants = groupMetadata.participants;
            
            // 3. تجهيز قائمة الـ JIDs للمنشن
            const jids = participants.map(p => p.id);
            
            // 4. استخراج الرسالة المرافقة (إن وجدت)
            const messageText = args.join(' ') || 'لا توجد رسالة مرافقة';

            // 5. تنسيق الرسالة بستايل ALPHA X
            let tagContent = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                             `> *✧────[ \`نـداء الـجـمـيـع\` ]────╮*\n` +
                             `> *┤ 📢┊ الـرسـالـة: ${messageText}*\n` +
                             `> *┤ 👥┊ الـعـدد: ${participants.length}*\n` +
                             `> *┤ 👤┊ الـمـنـادي: ${m.pushName}*\n` +
                             `> *┤────────────···*\n\n`;

            // إضافة المنشنات بشكل غير مرئي لتقليل الزحمة (تظهر في التنبيهات فقط)
            for (let participant of participants) {
                tagContent += ` @${participant.id.split('@')[0]}`;
            }

            tagContent += `\n\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            // 6. الإرسال مع تفعيل خاصية المنشن
            await sock.sendMessage(chatJid, { 
                text: tagContent, 
                mentions: jids 
            }, { quoted: m });

        } catch (error) {
            console.error("TagAll Error:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ، قد لا يمتلك البوت صلاحية جلب بيانات الأعضاء.' });
        }
    }
};
