import axios from 'axios'
import cheerio from 'cheerio'

export default {
  name: 'غوغل',
  aliases: ['google', 'غوجل'],
  category: 'بحث',
  description: 'البحث في Google',
  category: 'ق10',

  execute: async (sock, m, args) => {
    try {
      const jid = m.key.remoteJid
      const query = args.join(' ').trim()

      if (!query) {
        return sock.sendMessage(jid, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

🔎 اكتب ما تريد البحث عنه

مثال:
.غوغل الذكاء الاصطناعي`
        }, { quoted: m })
      }

      await sock.sendMessage(jid, {
        react: { text: '🚀', key: m.key }
      })

      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ar`

      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      })

      const $ = cheerio.load(data)
      const results = []

      $('div.g').each((i, el) => {
        const title = $(el).find('h3').text()
        const link = $(el).find('a').attr('href')

        if (title && link && results.length < 5) {
          results.push({ title, link })
        }
      })

      if (results.length === 0) {
        return sock.sendMessage(jid, {
          text: '❌ لا توجد نتائج'
        }, { quoted: m })
      }

      await sock.sendMessage(jid, {
        react: { text: '✅', key: m.key }
      })

      const textResults = results.map((r, i) => {
        return `\`#${i + 1}\` ${r.title}\n🔗 ${r.link || '—'}`
      }).join('\n\n')

      const msg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

🔎 البحث: ${query}

📊 النتائج:
${textResults}

𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`

      await sock.sendMessage(jid, {
        text: msg,
        contextInfo: {
          externalAdReply: {
            title: 'Google Search',
            body: query,
            thumbnailUrl: 'https://whatsapp.com/channel/0029VbAuG5h2ZjCvTamnRq1o'
          }
        }
      }, { quoted: m })

    } catch (e) {
      console.log("❌ Google Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        react: { text: '❌', key: m.key }
      })

      await sock.sendMessage(m.key.remoteJid, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

⚠️ حدث خطأ أثناء البحث`
      }, { quoted: m })
    }
  }
}