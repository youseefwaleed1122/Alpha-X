export default {
    name: 'حسابي',
    aliases: ['حساب', 'رصيدي', 'رصيد'],
    description: 'امر لعرض معلومات حسابك',
    category: 'ق9', // تم وضعه في القسم 10 كما طلبت في الملحوظة
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;
            const senderJid = m.key.participant || chatJid;

            // جلب بيانات المستخدم من القاعدة (الهاندلير يضمن وجودها)
            const user = db.data.users[senderJid];

            // بناء الرسالة بالتنسيق الذي طلبته
            const profileText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧──[ \`معلومات الحساب\` ]──╮*
> *┤ 👤┊ الاسم: ${user.name}*
> *┤ 🏆┊ الخبرة: ${user.exp}xp*
> *┤ 🎖️┊ المستوى: ${user.level}*
> *┤ 🏦┊ النقاط: ${user.bank}*
> *┤────────────···*

> *✧───[ ملحوظة ]───╮*
> *أكتب الأمر \`.ق7\` لعرض كل أوامر القسم*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { 
                text: profileText,
                mentions: [senderJid] 
            }, { quoted: m });

            return true;
        } catch (error) {
            console.error("❌ Error in Profile Command:", error);
        }
    }
};
