export default {
    name: 'حسابه',
    aliases: ['رصيده', 'معلوماته'],
    description: 'امر عرض حساب العضو',
    category: 'ق9',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;

            // 1. تحديد الشخص المستهدف (من المنشن أو الرد أو الرقم في args)
            let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                            m.message?.extendedTextMessage?.contextInfo?.participant ||
                            (args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

            // 2. إذا لم يتم تحديد شخص، نبه المستخدم
            if (!targetJid || targetJid.length < 15) {
                return sock.sendMessage(chatJid, { 
                    text: `> ⚠️ *يرجى الرد على الشخص المستهدف.*\n> *مثال:* .حسابه مع الرد على الرساله` 
                }, { quoted: m });
            }

            // 3. جلب بيانات الشخص من القاعدة
            const user = db.data.users[targetJid];

            // 4. إذا كان الشخص غير موجود في قاعدة بيانات البوت
            if (!user) {
                return sock.sendMessage(chatJid, { 
                    text: `> ❌ *هذا المستخدم غير مسجل في قاعدة بيانات ALPHA X BOT.*` 
                }, { quoted: m });
            }

            // 5. بناء الرسالة بنفس التنسيق الاحترافي
            const profileText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧──[ \`معلومات الحساب\` ]──╮*
> *┤ 👤┊ الاسم: ${user.name || 'مستخدم غير معروف'}*
> *┤ 🏆┊ الخبرة: ${user.exp || 0}xp*
> *┤ 🎖️┊ المستوى: ${user.level || 0}*
> *┤ 🏦┊ النقاط: ${user.bank || 0}*
> *┤────────────···*

> *✧───[ ملحوظة ]───╮*
> *هذه البيانات خاصة بالمستخدم المنشن*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { 
                text: profileText,
                mentions: [targetJid] 
            }, { quoted: m });

            return true;
        } catch (error) {
            console.error("❌ Error in GetProfile Command:", error);
        }
    }
};
