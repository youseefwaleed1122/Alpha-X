export default {
    name: 'يومي',
    aliases: ['راتب_يومي', 'هدية_يومية'],
    description: 'الحصول على نقاط يومية تزداد بزيادة مستواك',
    category: 'ق9',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;
            const senderJid = m.key.participant || chatJid;

            if (!db.data.users[senderJid]) {
                db.data.users[senderJid] = { name: m.pushName || 'User', bank: 0, lastDaily: 0, level: 0 };
            }

            const user = db.data.users[senderJid];
            
            // وقت الانتظار: 24 ساعة
            const timeout = 86400000; 
            const lastDaily = user.lastDaily || 0;
            const timePassed = Date.now() - lastDaily;

            if (timePassed < timeout) {
                const timeLeft = timeout - timePassed;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                return sock.sendMessage(chatJid, { 
                    text: `> ⏳ *عذراً، الراتب يُصرف مرة واحدة يومياً.*\n> *المتبقي:* ${hours} ساعة و ${minutes} دقيقة.` 
                }, { quoted: m });
            }

            // --- [ حساب المكافأة بناءً على المستوى ] ---
            const baseReward = Math.floor(Math.random() * 201) + 100; // عشوائي 100-300
            const levelBonus = (user.level || 0) * 50; // 50 نقطة لكل مستوى
            const totalReward = baseReward + levelBonus;

            // تحديث البيانات
            user.bank = (user.bank || 0) + totalReward;
            user.lastDaily = Date.now();

            const dailyText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐃𝐀𝐈𝐋𝐘~ 〕⌬ ╄╾ ━
>
> *✅ تم صرف راتبك اليومي بنجاح*
> *┤ 💰 المكافأة الأساسية: ${baseReward}*
> *┤ 🎖️ بونص المستوى (${user.level}): ${levelBonus}*
> *┤ 💵 الإجمالي: ${totalReward} نقطة*
> *┤────────────···*
> *🏦 رصيدك الكلي أصبح: ${user.bank}*
> *🚀 كلما زاد مستواك، زاد راتبك!*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷Alpha 𝚇 𝙱𝙾𝚃`.trim();

            await sock.sendMessage(chatJid, { 
                text: dailyText,
                mentions: [senderJid]
            }, { quoted: m });

            db.save();

        } catch (error) {
            console.error("❌ Daily Reward Error:", error);
        }
    }
};
