const numerosEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export default {
    name: 'اكس',
    aliases: ['xo'],
    description: 'لعب إكس أو حماسية للتحدي',
    category: 'ق7',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        const senderJid = m.key.participant || chatJid;
        const action = args[0]?.toLowerCase();

        if (action === 'فتح') {
            if (global.activeGames.has(chatJid)) return sock.sendMessage(chatJid, { text: '❌ | توجد لعبة نشطة بالفعل.' });
            
            global.activeGames.set(chatJid, {
                type: 'xo',
                chat: chatJid,
                players: [senderJid],
                board: [...numerosEmoji],
                turn: senderJid,
                started: false
            });
            return sock.sendMessage(chatJid, { text: `> 🎮 *تم فتح غرفة إكس أو*\n> *📌 للانضمام:* اكتب \`.اكس دخول\`` });
        }

        if (action === 'دخول') {
            const sala = global.activeGames.get(chatJid);
            if (!sala || sala.type !== 'xo') return sock.sendMessage(chatJid, { text: '❌ | لا توجد غرفة!' });
            if (sala.players.includes(senderJid)) return sock.sendMessage(chatJid, { text: '❌ | أنت مسجل بالفعل!' });

            sala.players.push(senderJid);
            sala.started = true;
            
            const [p1, p2] = sala.players;
            const startMsg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐆𝐀𝐌𝐄𝐒~ 〕⌬ ╄╾ ━\n` +
                           `> 🎮 *لعبة إكس أو (XO)*\n\n` +
                           `> *👤 لاعب 1:* @${p1.split('@')[0]} (❌)\n` +
                           `> *👤 لاعب 2:* @${p2.split('@')[0]} (⭕)\n\n` +
                           `   ${sala.board[0]}  ${sala.board[1]}  ${sala.board[2]}\n   ${sala.board[3]}  ${sala.board[4]}  ${sala.board[5]}\n   ${sala.board[6]}  ${sala.board[7]}  ${sala.board[8]}\n\n` +
                           `> 🎯 *بدأت اللعبة الدور على @${p1.split('@')[0]}*\n\n` +
                           `> *أرسل الرقم (1-9) مباشرة للعب.*\n\n` +
                           `> *🏆 الجائزة:* 300 نقطة\n` +
                           `> *┤────────────···*\n` +
                           `> 𝙱𝚈┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            return sock.sendMessage(chatJid, { text: startMsg, mentions: [p1, p2] });
        }
    }
};
