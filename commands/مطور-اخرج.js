export default {
    name: 'اخرج',
    aliases: ['خروج', 'leave'],
    category: 'ق3',
    description: 'يخرج البوت من الجروب',
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

            // ✅ التحقق أن الأمر في جروب
            if (!chatJid.endsWith('@g.us')) {
                await sock.sendMessage(chatJid, {
                    text: '❌ هذا الأمر يعمل فقط داخل المجموعات'
                }, { quoted: m })
                return false
            }

            // ✅ إرسال رسالة الوداع
            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *✧────[ \`الرسالة\` ]────╮*\n> *┤ 🤖┊ تلقيت أمر من مطوري بالخروج من الجروب✔️*\n> َ\n> *┤ 🤗┊ وداعا. ألفا يحبكم*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
            }, { quoted: m })

            // ✅ الخروج من الجروب بعد ثانية
            setTimeout(async () => {
                await sock.groupLeave(chatJid)
            }, 1000)

            return true

        } catch (error) {
            console.error("❌ Error in Leave Command:", error)
        }
    }
}
