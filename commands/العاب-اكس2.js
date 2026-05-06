const numerosEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export default {
    name: 'اكس_بوت',
    aliases: ['xobot'],
    category: 'ق7',
    description: 'لعب إكس أو ضد ذكاء البوت الاصطناعي',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        const senderJid = m.key.participant || chatJid;

        if (global.activeGames.has(chatJid)) {
            return sock.sendMessage(chatJid, { text: '❌ | توجد لعبة نشطة بالفعل في هذه المجموعة.' });
        }

        // إنشاء اللعبة ونوعها xo_bot
        global.activeGames.set(chatJid, {
            type: 'xo_bot',
            chat: chatJid,
            players: [senderJid],
            board: [...numerosEmoji],
            turn: senderJid,
            started: true // تبدأ فوراً ضد البوت
        });

        const startMsg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐆𝐀𝐌𝐄𝐒~ 〕⌬ ╄╾ ━\n` +
                       `> 🎮 *تحدي إكس أو ضد البوت*\n\n` +
                       `> *👤 اللاعب:* @${senderJid.split('@')[0]} (❌)\n` +
                       `> *🤖 الخصم:* ALPHA-BOT (⭕)\n\n` +
                       `   1️⃣  2️⃣  3️⃣\n   4️⃣  5️⃣  6️⃣\n   7️⃣  8️⃣  9️⃣\n\n` +
                       `> 🎯 *ابدأ اللعب يا @${senderJid.split('@')[0]}*\n` +
                       `> *أرسل الرقم (1-9) مباشرة.*\n` +
                       `> *🏆 الجائزة:* 100 نقطة\n` +
                       `> *┤────────────···*\n` +
                       `> 𝙱𝚈┇𝙰𝙻𝙿𝐇𝙰 𝚇 𝙱𝙾𝚃`;

        return sock.sendMessage(chatJid, { text: startMsg, mentions: [senderJid] }, { quoted: m });
    }
};
