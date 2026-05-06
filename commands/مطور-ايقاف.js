export default {
    name: 'ايقاف',
    aliases: ['اغلاق', 'stop'],
    category: 'ق3',
    description: 'إيقاف البوت عن العمل',
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

            // ✅ إرسال رسالة الإيقاف
            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *⚠️ جاري إيقاف البوت...*\n> *🔴 البوت سيتوقف الآن*\n> *⋅ ───━ •﹝♦﹞• ━─── ⋅*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
            }, { quoted: m })

            // ✅ إيقاف البوت بعد ثانية
            setTimeout(() => {
                process.exit(0)
            }, 1000)

            return true

        } catch (error) {
            console.error("❌ Error in Stop Command:", error)
        }
    }
}