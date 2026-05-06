export default {
    name: 'ترتيب',
    aliases: ['ترتيب', 'المتصدرين', 'الأغنى'],
    description: 'عرض قائمة أغنى الحسابات',
    category: 'ق9',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;

            // 1. جلب كل المستخدمين وتحويلهم لمصفوفة
            let users = Object.entries(db.data.users).map(([id, data]) => ({
                id,
                ...data
            }));

            // 2. منطق الترتيب (النقاط أولاً، ثم المستوى، ثم الخبرة)
            users.sort((a, b) => {
                if ((b.bank || 0) !== (a.bank || 0)) return (b.bank || 0) - (a.bank || 0);
                if ((b.level || 0) !== (a.level || 0)) return (b.level || 0) - (a.level || 0);
                return (b.exp || 0) - (a.exp || 0);
            });

            // 3. تحديد عدد الحسابات التي ستعرض بناءً على شرطك
            let limit;
            const totalUsers = users.length;

            if (totalUsers < 5) {
                limit = totalUsers;
            } else if (totalUsers < 15) {
                limit = 3;
            } else {
                limit = 10;
            }

            const topUsers = users.slice(0, limit);

            // 4. بناء رسالة الترتيب
            let leaderboardText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐓𝐎𝐏~ 〕⌬ ╄╾ ━\n>\n`;
            leaderboardText += `> *قائمة أفضل ${limit} مستخدمين حالياً:*\n`;
            leaderboardText += `> *┤────────────···*\n`;

            const medals = ['🥇', '🥈', '🥉'];

            topUsers.forEach((user, index) => {
                const icon = medals[index] || '👤';
                const name = user.name || 'User';
                leaderboardText += `> *┤ ${icon} المركز ${index + 1}*\n`;
                leaderboardText += `> *┤ ✨ الاسم: ${name}*\n`;
                leaderboardText += `> *┤ 🏦 النقاط: ${user.bank || 0}*\n`;
                leaderboardText += `> *┤ 🎖️ المستوى: ${user.level || 0} (XP: ${user.exp || 0})*\n`;
                leaderboardText += `> *┤────────────···*\n`;
            });

            leaderboardText += `> *⋅ ───━ •﹝♦﹞• ━─── ⋅*\n`;
            leaderboardText += `> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝐀 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { 
                text: leaderboardText,
                mentions: topUsers.map(u => u.id)
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Leaderboard Error:", error);
        }
    }
};
