import db from './database.js';

if (!global.activeGames) global.activeGames = new Map();

export default async function gamesSystem(sock, m, ctx) {
    // 1. جدار الحماية: منع الانهيار إذا كانت الرسالة حدث نظام أو فارغة
    if (!m || m.isGroupUpdate || !m.key) return;

    const chatJid = m.key.remoteJid;
    const senderJid = m.key.participant || chatJid;
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim();

    // التحقق من وجود لعبة نشطة
    const sala = global.activeGames.get(chatJid);
    if (!sala || !sala.started) return;

    // 2. محرك الألعاب (توسعي)
    switch (sala.type) {
        
                      // --- [ لعبة XO & XO_BOT ] ---
        case 'xo':
        case 'xo_bot': {
            const isNumber = /^[1-9]$/.test(text);
            if (!isNumber) return;

            if (sala.turn !== senderJid) return sock.sendMessage(chatJid, { text: '⛔ | انتظر دورك!' }, { quoted: m });

            const move = parseInt(text) - 1;
            if (sala.board[move] === '❌' || sala.board[move] === '⭕') {
                return sock.sendMessage(chatJid, { text: '❌ | المكان محجوز!' }, { quoted: m });
            }

            // تحديد رمز اللاعب الحالي: 
            // إذا كان اللاعب هو الأول في المصفوفة يأخذ ❌ وإلا يأخذ ⭕
            const playerSymbol = (sala.players[0] === senderJid) ? '❌' : '⭕';
            sala.board[move] = playerSymbol;

            const getWinner = (b) => {
                const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                for (let pattern of winPatterns) {
                    const [a, b1, c] = pattern;
                    if (b[a] && (b[a] === '❌' || b[a] === '⭕') && b[a] === b[b1] && b[a] === b[c]) return b[a];
                }
                if (b.every(v => v === '❌' || v === '⭕')) return 'draw';
                return null;
            };

            let result = getWinner(sala.board);

            // دور الخصم
            if (!result && sala.type === 'xo_bot') {
                const emptySlots = sala.board.map((v, i) => (v !== '❌' && v !== '⭕') ? i : null).filter(v => v !== null);
                if (emptySlots.length > 0) {
                    const botMove = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                    sala.board[botMove] = '⭕'; // البوت دائماً ⭕
                    result = getWinner(sala.board);
                }
            } else if (!result) {
                // تبديل الدور للاعب الثاني
                sala.turn = sala.players.find(p => p !== senderJid);
            }

            let extra = '';
            let finished = false;

            if (result) {
                finished = true;
                if (result === 'draw') {
                    extra = '🤝 *النتيجة: تعادل!*';
                } else {
                    // الفائز هو صاحب الرمز الذي أعادته الدالة
                    // إذا كان اللاعب الحالي هو صاحب الرمز الفائز
                    const winnerJid = (result === playerSymbol) ? senderJid : (sala.type === 'xo_bot' ? 'bot' : sala.players.find(p => p !== senderJid));
                    
                    if (winnerJid !== 'bot') {
                        const prize = (sala.type === 'xo_bot' ? 100 : 300);
                        db.data.users[winnerJid].bank += prize;
                        db.save();
                        extra = `🏆 *مبروك الفوز يا @${winnerJid.split('@')[0]}!* \n> *💰 الجائزة:* +${prize} نقطة`;
                    } else {
                        extra = `💀 *للأسف، البوت غلبك!*`;
                    }
                }
            } else {
                extra = `🎯 *الدور الآن على @${sala.turn.split('@')[0]}*`;
            }

            const boardMsg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐆𝐀𝐌𝐄𝐒~ 〕⌬ ╄╾ ━\n` +
                            `> 🎮 *لعبة إكس أو (${sala.type === 'xo_bot' ? 'ضد البوت' : 'لاعبين'})*\n\n` +
                            `   ${sala.board[0]}  ${sala.board[1]}  ${sala.board[2]}\n` +
                            `   ${sala.board[3]}  ${sala.board[4]}  ${sala.board[5]}\n` +
                            `   ${sala.board[6]}  ${sala.board[7]}  ${sala.board[8]}\n\n` +
                            `> ${extra}\n\n` +
                            `> *أرسل الرقم (1-9) للعب.*\n` +
                            `> *┤────────────···*\n` +
                            `> 𝙱𝚈┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { text: boardMsg, mentions: [senderJid, sala.turn] }, { quoted: m });
            if (finished) global.activeGames.delete(chatJid);
            return true;
        }



                // --- [ لعبة الرياضيات ] ---
        case 'math': {
            // التحقق أن الرد هو رقم (قد يحتوي على فاصلة عشرية)
            if (isNaN(parseFloat(text))) return;

            const userAns = parseFloat(text);
            const isCorrect = (Math.abs(userAns - sala.result) < 0.1); // سماحية بسيطة للكسور

            if (isCorrect) {
                const prize = sala.exp;
                db.data.users[senderJid].bank = (db.data.users[senderJid].bank || 0) + prize;
                db.save();
                
                await sock.sendMessage(chatJid, { text: `✅ *إجابة صحيحة يا @${senderJid.split('@')[0]}!*\n> *💰 الجائزة:* +${prize} رصيد بنك 🏦`, mentions: [senderJid] }, { quoted: m });
                global.activeGames.delete(chatJid);
            } else {
                sala.intentos--;
                if (sala.intentos <= 0) {
                    await sock.sendMessage(chatJid, { text: `❌ *انتهت المحاولات!*\n> الإجابة الصحيحة هي: *${sala.result}*` }, { quoted: m });
                    global.activeGames.delete(chatJid);
                } else {
                    return sock.sendMessage(chatJid, { text: `❌ *إجابة خاطئة!*\n> تبقى لك *${sala.intentos}* محاولات.` }, { quoted: m });
                }
            }
            return true;
        }

//اضافة العاب جديدة
    }
}
