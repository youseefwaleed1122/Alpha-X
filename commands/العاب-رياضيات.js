const dificultades = {
  سهل: { ops: ['+', '-'], min: 1, max: 20, tiempo: 20000, exp: 150 },
  متوسط: { ops: ['+', '-', '*'], min: 10, max: 50, tiempo: 25000, exp: 400 },
  صعب: { ops: ['*', '/'], min: 20, max: 100, tiempo: 30000, exp: 800 },
  تعجيزي: { ops: ['*', '/'], min: 50, max: 500, tiempo: 40000, exp: 1500 }
};

export default {
    name: 'رياضيات',
    aliases: ['حساب', 'math'],
    description: 'لعبة تحدي الرياضيات والحساب',
    category: 'ق7',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        const diffInput = args[0] || 'سهل';

        if (global.activeGames.has(chatJid)) return m.reply('❌ | توجد لعبة نشطة بالفعل في هذه المجموعة!');

        const nivel = dificultades[diffInput];
        if (!nivel) return m.reply(`⚠️ *مستوى غير صحيح!*\nالمستويات المتاحة:\n${Object.keys(dificultades).map(k => `- ${k}`).join('\n')}\n\n*مثال:* .رياضيات متوسط`);

        // توليد المسألة
        const a = Math.floor(Math.random() * (nivel.max - nivel.min + 1)) + nivel.min;
        const b = Math.floor(Math.random() * (nivel.max - nivel.min + 1)) + nivel.min;
        const op = nivel.ops[Math.floor(Math.random() * nivel.ops.length)];
        
        let result;
        if (op === '/') {
            result = parseFloat((a / b).toFixed(1));
        } else if (op === '*') {
            result = a * b;
        } else if (op === '-') {
            result = a - b;
        } else {
            result = a + b;
        }

        // تسجيل اللعبة في الذاكرة العامة
        global.activeGames.set(chatJid, {
            type: 'math',
            result: result,
            exp: nivel.exp,
            intentos: 3,
            started: true
        });

        const questMsg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐌𝐀𝐓𝐇~ 〕⌬ ╄╾ ━\n` +
                        `> 🎮 *تحدي الذكاء الحسابي*\n\n` +
                        `> 🧩 أجب على المسألة التالية:\n` +
                        `> *${a} ${op === '/' ? '÷' : op === '*' ? '×' : op} ${b} = ?*\n\n` +
                        `> 🧭 الوقت: *${nivel.tiempo / 1000} ثانية*\n` +
                        `> 🏆 الجائزة: *${nivel.exp} رصيد بنك*\n` +
                        `> 💡 لديك 3 محاولات فقط.\n` +
                        `> *┤────────────···*\n` +
                        `> 𝙱𝚈┇𝙰𝙻𝙿𝐇𝙰 𝚇 𝙱𝙾𝚃`;

        await sock.sendMessage(chatJid, { text: questMsg }, { quoted: m });

        // مؤقت انتهاء الوقت
        setTimeout(async () => {
            const game = global.activeGames.get(chatJid);
            if (game && game.type === 'math' && game.result === result) {
                global.activeGames.delete(chatJid);
                await sock.sendMessage(chatJid, { text: `⌛ *انتهى الوقت!*\n> الإجابة الصحيحة كانت: *${result}*` });
            }
        }, nivel.tiempo);
    }
};
