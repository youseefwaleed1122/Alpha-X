export default {
    name: 'ريستر',
    aliases: ['اعادة', 'restart'],
    category: 'ق3',
    description: 'إعادة تشغيل البوت',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid
            const senderJid = m.key?.participant || m.participant || chatJid

            // ✅ التحقق من صلاحية المطور
            const isOwner = ctx.cfg.ownerNumber === senderJid || ctx.cfg.eliteNumbers.includes(senderJid)
            if (!isOwner) {
                await sock.sendMessage(chatJid, {
                    text: '⛔ هذا الأمر مخصص للمطور فقط'
                }, { quoted: m })
                return false
            }

            // ✅ إرسال رسالة الريستر
            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *🔄 جاري إعادة التشغيل...*\n> *⏳ سيعود البوت خلال ثوانٍ*\n> *⋅ ───━ •﹝♦﹞• ━─── ⋅*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
            }, { quoted: m })

            // ✅ إعادة التشغيل بعد ثانية
            setTimeout(() => {
                process.exit(1)
            }, 1000)

            return true

        } catch (error) {
            console.error("❌ Error in Restart Command:", error)
        }
    }
}