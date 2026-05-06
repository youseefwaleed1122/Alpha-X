import axios from 'axios'

export default {
  name: 'تيك',
  aliases: ['tiktok', 'tt'],
  category: 'تحميل',
  description: 'تحميل فيديوهات تيك توك',
  category: 'ق10',

  execute: async (sock, m, args) => {
    try {
      const jid = m.key.remoteJid

      if (!args || args.length === 0) {
        return sock.sendMessage(jid, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

📌 الاستخدام:

1️⃣ تحميل من رابط:
.تيك [الرابط] فيديو
.تيك [الرابط] صوت

2️⃣ بحث وتحميل مباشر:
.تيك سونغ

`
        }, { quoted: m })
      }

      const input = args.join(' ').trim()

      await sock.sendMessage(jid, {
        react: { text: '🕒', key: m.key }
      })

      const isUrl = /tiktok\.com|vt\.tiktok|vm\.tiktok/.test(input)

      /* =========================
         🎬 تحميل من رابط
      ========================= */
      if (isUrl) {
        const type = input.includes('صوت') ? 'audio' : 'video'
        const url = input.split(' ')[0]

        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)
        const data = res.data?.data

        if (!data?.play) {
          return sock.sendMessage(jid, {
            text: '❌ الرابط غير صالح'
          }, { quoted: m })
        }

        if (type === 'video') {
          await sock.sendMessage(jid, {
            video: { url: data.play },
            caption: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

🎬 تم تحميل الفيديو`
          }, { quoted: m })

        } else {
          await sock.sendMessage(jid, {
            audio: { url: data.music },
            mimetype: 'audio/mpeg',
            fileName: 'tiktok.mp3'
          }, { quoted: m })
        }

        await sock.sendMessage(jid, {
          react: { text: '✅', key: m.key }
        })

        return
      }

      /* =========================
         🔎 بحث وتحميل أول فيديو
      ========================= */
      const res = await axios.post('https://tikwm.com/api/feed/search', {
        keywords: input,
        count: 1,
        HD: 1
      })

      const video = res.data?.data?.videos?.[0]

      if (!video) {
        return sock.sendMessage(jid, {
          text: '❌ لم يتم العثور على نتائج'
        }, { quoted: m })
      }

      await sock.sendMessage(jid, {
        video: { url: video.play },
        caption: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

🎬 ${video.title || 'TikTok Video'}
👤 ${video.author?.nickname || 'Unknown'}`
      }, { quoted: m })

      await sock.sendMessage(jid, {
        react: { text: '✔️', key: m.key }
      })

    } catch (e) {
      console.log("❌ TikTok Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

⚠️ حدث خطأ أثناء التحميل`
      }, { quoted: m })
    }
  }
}
