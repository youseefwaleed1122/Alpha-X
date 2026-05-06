import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

export default {
  name: 'اغنية',
  aliases: [],
  category: 'تحميل',
  description: 'تحميل أغنية من يوتيوب',
  category: 'ق10',

  execute: async (sock, m, args) => {
    try {
      const jid = m.key.remoteJid

      if (!args || args.length === 0) {
        return sock.sendMessage(jid, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> 🎵 اكتب اسم الأغنية
> مثال:
> .اغنية despacito`
        }, { quoted: m })
      }

      const query = args.join(' ').trim()

      const tempDir = './temp'
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      const audioPath = path.join(tempDir, `song_${Date.now()}.mp3`)

      // 🎶 تفاعل
      await sock.sendMessage(jid, {
        react: { text: '🎶', key: m.key }
      })

      const cmd = `yt-dlp -x --audio-format mp3 "ytsearch1:${query}" -o "${audioPath}"`

      exec(cmd, async (err) => {
        if (err || !fs.existsSync(audioPath)) {
          console.log("❌ Download error:", err?.message)

          await sock.sendMessage(jid, {
            react: { text: '❌', key: m.key }
          })

          return sock.sendMessage(jid, {
            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> ❌ فشل تحميل:
> 🎵 ${query}`
          }, { quoted: m })
        }

        await sock.sendMessage(jid, {
          react: { text: '✅', key: m.key }
        })

        const caption = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> 🎶 تم تحميل الأغنية بنجاح
> 📝 الاسم: ${query}
> 📥 المصدر: YouTube
> 🤖 البوت: ALPHA X`

        try {
          const audio = fs.readFileSync(audioPath)

          await sock.sendMessage(jid, {
            audio: audio,
            mimetype: 'audio/mpeg',
            caption
          }, { quoted: m })

        } catch (sendErr) {
          console.log("❌ Send error:", sendErr)

          await sock.sendMessage(jid, {
            text: `❌ حدث خطأ أثناء إرسال الأغنية`
          }, { quoted: m })
        }

        // 🧹 حذف الملف
        try {
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath)
        } catch {}
      })

    } catch (e) {
      console.log("❌ Song Command Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> ⚠️ حدث خطأ غير متوقع`
      }, { quoted: m })
    }
  }
}
