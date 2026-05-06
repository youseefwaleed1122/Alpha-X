export default {
    name: 'اسبوعي',
    aliases: ['راتب_اسبوعي', 'هدية_اسبوعية'],
    description: 'امر هدية اسبوعيه عشوائية',
    category: 'ق9',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;
            const senderJid = m.key.participant || chatJid;

            if (!db.data.users[senderJid]) {
                db.data.users[senderJid] = { name: m.pushName || 'User', bank: 0, lastWeekly: 0, level: 0 };
            }

            const user = db.data.users[senderJid];
            
            // وقت الانتظار: 7 أيام (7 * 24 * 60 * 60 * 1000 بالملي ثانية)
            const timeout = 604800000; 
            const lastWeekly = user.lastWeekly || 0;
            const timePassed = Date.now() - lastWeekly;

            if (timePassed < timeout) {
                const timeLeft = timeout - timePassed;
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                return sock.sendMessage(chatJid, { 
                    text: `> ⏳ *صبراً! هذه الجائزة تُصرف مرة كل أسبوع.*\n> *المتبقي:* ${days} يوم و ${hours} ساعة.` 
                }, { quoted: m });
            }

            // --- [ حساب المكافأة الأسبوعية الضخمة ] ---
            // مكافأة أساسية بين 1000 و 3000 نقطة
            const baseReward = Math.floor(Math.random() * 2001) + 1000; 
            // بونص مستوى قوي: 200 نقطة لكل مستوى
            const levelBonus = (user.level || 0) * 200; 
            const totalReward = baseReward + levelBonus;

            // تحديث البيانات
            user.bank = (user.bank || 0) + totalReward;
            user.lastWeekly = Date.now();

            const weeklyText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐖𝐄𝐄𝐊𝐋𝐘~ 〕⌬ ╄╾ ━

> *🎁 تم استلام الجائزة الأسبوعية الكبرى*
> *┤ 💰 المكافأة الأساسية: ${baseReward}*
> *┤ 🎖️ بونص الخبرة (${user.level}): ${levelBonus}*
> *┤ 💵 الإجمالي: ${totalReward} نقطة*
> *┤────────────···*
> *🏦 رصيدك الإجمالي: ${user.bank}*
> *🌟 انتظرنا الأسبوع القادم لمكافأة أكبر!*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷 𝚇 𝙱𝙾𝚃`.trim();

            await sock.sendMessage(chatJid, { 
                text: weeklyText,
                mentions: [senderJid]
            }, { quoted: m });

            db.save();

        } catch (error) {
            console.error("❌ Weekly Reward Error:", error);
        }
    }
};
