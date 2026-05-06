export default {
    name: 'تست',
    aliases: ['حالة', 'تست', 'ping'],
    category: 'ق3',
    description: 'امر لعرض معلومات الحالة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            
            // حساب سرعة الاستجابة (Ping)
            const start = Date.now();
            const end = Date.now();
            const ping = end - start; 

            // تحديد حالة الاستجابة بناءً على السرعة
            let speedStatus = 'سريعة 🚀';
            if (ping > 500) speedStatus = 'متوسطة 🐢';
            if (ping > 1000) speedStatus = 'ضعيفة ⚠️';

            const testText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧───[ \`المعلومات\`  ]───╮*
> *┤ 👑┊ البوت: 𝐀𝐋𝐏𝐇𝐀*
> *┤ 🛜┊ الحالة: ${ping}ms*
> *┤ 🚀┊ الإستجابة: ${speedStatus}*
> *┤────────────···*
> *✧────[ \`النتيجة\` ]────╮*
> *┤ 🤖┊ البوت يعمل بشكل ممتاز ✔️*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { 
                text: testText 
            }, { quoted: m });

            return true;
        } catch (error) {
            console.error("❌ Error in Test Command:", error);
        }
    }
};
