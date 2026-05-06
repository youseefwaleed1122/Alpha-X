import axios from 'axios'

export default {
    name: 'ايديت',
    aliases: ['edit', 'ايديتات', 'تيك-ايديت'],
    category: 'تيك توك',
    description: 'جلب ايديت لشخصيات من تيك توك',
    category: 'ق10',

    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid
            const text = args.join(' ').trim()

            if (!text) {
                return sock.sendMessage(chatJid, {
                    text: `🎬 اكتب اسم الشخصية\n\nمثال:\n.ايديت ساسكي`
                }, { quoted: m })
            }

            await sock.sendMessage(chatJid, {
                react: { text: '🔎', key: m.key }
            })

            const res = await axios.post('https://tikwm.com/api/feed/search', {
                keywords: text,
                count: 10,
                HD: 1
            })

            const videos = res.data?.data?.videos

            if (!videos || videos.length === 0) {
                return sock.sendMessage(chatJid, {
                    text: '❌ ما لقيت نتائج لهالموضوع'
                }, { quoted: m })
            }

            const video = videos[0]

            await sock.sendMessage(chatJid, {
                react: { text: '🎬', key: m.key }
            })

            const caption = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *🎬┇ايديت تيك توك*
> *🧠┇الاسم: ${text}*
> *👤┇العنوان: ${video.title || 'بدون عنوان'}*
> *📥┇البوت: ALPHA X*

> ⋅ ───━ •﹝♦﹞• ━─── ⋅`

            await sock.sendMessage(chatJid, {
                video: { url: video.play },
                caption
            }, { quoted: m })

            await sock.sendMessage(chatJid, {
                react: { text: '✅', key: m.key }
            })

        } catch (error) {
            console.error("❌ Error in Edit Command:", error)

            try {
                await sock.sendMessage(m.key.remoteJid, {
                    react: { text: '❌', key: m.key }
                })
            } catch {}

            await sock.sendMessage(m.key.remoteJid, {
                text: '⚠️ حدث خطأ أثناء جلب الايديت'
            }, { quoted: m })
        }
    }
}