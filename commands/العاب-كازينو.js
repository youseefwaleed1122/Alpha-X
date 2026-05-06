const cooldown = 30000; // 30 ثانية

export default {
    name: 'كازينو',
    aliases: ['حظ', 'slot', 'ماكينة'],
    description: 'لعبة كازينو الحظ للربح',
    category: 'ق7',
    execute: async (sock, m, args, ctx) => {
        const { db } = ctx;
        const chatJid = m.key.remoteJid;
        const senderJid = m.key.participant || chatJid;
        const user = db.data.users[senderJid];
        const now = Date.now();

        // --- [ نظام الكول داون ] ---
        const last = user.wait_slot || 0;
        const remaining = last + cooldown - now;
        if (remaining > 0) {
            const s = Math.floor(remaining / 1000);
            return sock.sendMessage(chatJid, { text: `> *🕓 اهدأ قليلاً، انتظر ( ${s} ثانية ) قبل اللعب مجدداً.*` }, { quoted: m });
        }

        // --- [ تحليل المبلغ ] ---
        let cantidad = parseInt(args[0]);
        if (isNaN(cantidad) || cantidad < 10) {
            return sock.sendMessage(chatJid, { text: `> ⚠️ *حدد مبلغاً صالحاً للمراهنة من البنك.*\n> *مثال: .كازينو 100*` }, { quoted: m });
        }

        if ((user.bank || 0) < cantidad) {
            return sock.sendMessage(chatJid, { text: `> ❌ *رصيدك في البنك غير كافٍ. لديك حالياً: ( ${user.bank || 0} )*` }, { quoted: m });
        }

        // --- [ إعدادات اللعبة ] ---
        const emojis = ['🐲', '💎', '⚡', '🪙', '🔥', '🐉', '⭐', '🍎'];
        const rand = () => emojis[Math.floor(Math.random() * emojis.length)];
        const renderBoard = (b) => `*╔═════ 🎰 ═════╗*\n     ${b[0].join(' | ')}\n     ${b[1].join(' | ')}\n     ${b[2].join(' | ')}\n*╚═════ 🎰 ═════╝*`;

        // 1. إرسال الرسالة الأولى (بداية التدوير)
        let { key } = await sock.sendMessage(chatJid, { 
            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐒𝐋𝐎𝐓𝐒~ 〕⌬ ╄╾ ━\n> 🎰 *جاري تحريك الماكينة...*\n\n${renderBoard([[rand(), rand(), rand()], [rand(), rand(), rand()], [rand(), rand(), rand()]])}` 
        }, { quoted: m });

        // 2. "تحريك" الرموز (تحديث الرسالة 3 مرات لإعطاء تأثير الحركة)
        for (let i = 0; i < 3; i++) {
            await new Promise(res => setTimeout(res, 600));
            let tempBoard = [[rand(), rand(), rand()], [rand(), rand(), rand()], [rand(), rand(), rand()]];
            await sock.sendMessage(chatJid, { text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐒𝐋𝐎𝐓𝐒~ 〕⌬ ╄╾ ━\n> 🎰 *جاري تحريك الماكينة...*\n\n${renderBoard(tempBoard)}`, edit: key });
        }

        // 3. النتيجة النهائية
        const final = [
            [rand(), rand(), rand()],
            [rand(), rand(), rand()],
            [rand(), rand(), rand()],
        ];

        const line = final[1]; // السطر الفائز هو الأوسط
        let ganancia = 0;
        let msg = '';

        if (line[0] === line[1] && line[1] === line[2]) {
            ganancia = cantidad * 3;
            msg = `*🎊 مذهل! فوز ثلاثي ملكي! 🎊*`;
        } else if (line[0] === line[1] || line[1] === line[2] || line[0] === line[2]) {
            ganancia = Math.floor(cantidad * 1.5);
            msg = `*✨ تطابق ثنائي.. ربح متوسط! ✨*`;
        } else {
            ganancia = -cantidad;
            msg = `*💀 حظاً عاثراً.. ابتلع التنين مراهنتك!*`;
        }

        // تحديث البيانات
        user.bank = (user.bank || 0) + ganancia;
        user.wait_slot = now;
        db.save();

        const resultRender = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐒𝐋𝐎𝐓𝐒~ 〕⌬ ╄╾ ━\n` +
                            `> 🎰 *ماكينة حظ التنين*\n\n` +
                            `${renderBoard(final)}\n\n` +
                            `> ${msg}\n` +
                            `> ${ganancia > 0 ? `➕ ربحت: ${ganancia}` : `➖ خسرت: ${Math.abs(ganancia)}`} رصيد بنك 🏦\n` +
                            `> *┤────────────···*\n` +
                            `> *رصيدك الحالي بالبنك:* ${user.bank}\n` +
                            `> 𝙱𝚈┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

        await new Promise(res => setTimeout(res, 500));
        return sock.sendMessage(chatJid, { text: resultRender, edit: key });
    }
};
