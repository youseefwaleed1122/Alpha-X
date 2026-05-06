export default {
    name: 'تحويل',
    aliases: ['give', 'هدية', 'تبرع'],
    description: 'امر تحويل نقاط لحساب تاني',
    category: 'ق9',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;

            // 1. تحديد المرسل والمستهدف
            const senderJid = m.key.participant || chatJid;
            let rawTarget = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                            m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!rawTarget) return sock.sendMessage(chatJid, { text: '⚠️ منشن الشخص أو رد عليه.' }, { quoted: m });

            const amount = parseInt(args.find(a => !isNaN(a) && !a.includes('@')));
            if (isNaN(amount) || amount <= 0) return sock.sendMessage(chatJid, { text: '⚠️ حدد المبلغ.' }, { quoted: m });

            // 2. جلب بيانات المرسل
            const sender = db.data.users[senderJid];
            if (!sender || sender.bank < amount) {
                return sock.sendMessage(chatJid, { text: `❌ رصيدك غير كافٍ! رصيدك: ${sender?.bank || 0}` }, { quoted: m });
            }

            // 3. البحث الذكي عن المستقبل (عن طريق الاسم لتجنب تكرار LID)
            // نأخذ اسم الشخص المستهدف أولاً
            const targetName = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.pushName || "𝐒𝐔𝐍𝐆 𝐁𝐎𝐓"; 
            
            // نبحث في القاعدة عن أي حساب يملك هذا الاسم
            let targetKey = Object.keys(db.data.users).find(key => 
                key.includes('@s.whatsapp.net') && db.data.users[key].name === targetName
            ) || rawTarget; // إذا لم يجد الاسم، يستخدم المعرف الذي جاء من الواتساب

            if (targetKey === senderJid) return sock.sendMessage(chatJid, { text: `❌ لا يمكنك التحويل لنفسك.` }, { quoted: m });

            // 4. ضمان وجود الحساب وتنفيذ العملية
            if (!db.data.users[targetKey]) db.data.users[targetKey] = { name: 'User', bank: 0, exp: 0, level: 0, role: 'E' };
            const receiver = db.data.users[targetKey];

            sender.bank -= amount;
            receiver.bank += amount;

            // 5. رسالة النجاح
            const successText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐀𝐍𝐊~ 〕⌬ ╄╾ ━
> *✅ تمت العملية بنجاح*
> *┤ 📤 من: ${sender.name || 'أنت'}*
> *┤ 📥 إلى: ${receiver.name || 'المستلم'}*
> *┤ 💰 المبلغ: ${amount} نقطة*
> *┤────────────···*
> *🏦 رصيدك المتبقي: ${sender.bank}*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`.trim();

            await sock.sendMessage(chatJid, { 
                text: successText, 
                mentions: [senderJid, targetKey] 
            }, { quoted: m });

            db.save();
        } catch (error) { console.error("Final Transfer Error:", error); }
    }
};
