import axios from "axios"
import fetch from "node-fetch"
import cheerio from "cheerio"

export default {
  name: 'لوجو',
  aliases: [],
  tags: ['logo'],
  help: ['لوجو <اسم>'],
  description: 'صمم شعار جميل لإسمك او منتجك او نقابتك',
  category: 'ق8',

  execute: async (sock, m, args, { cfg }) => {
    try {
      const chat = m.key.remoteJid
      const text = args.join(" ")

      if (!text) {
        return sock.sendMessage(chat, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`خطأ\` ]────╮*
> *┤ ❌┊ اكتب اسم لصنع الشعار*
> *┤ 💡┊ مثال:*
> *┤ .لوجو Alpha Bot*
> *┤────────────···*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
        }, { quoted: m })
      }

      // ⏳ رسالة انتظار بزينة
      await sock.sendMessage(chat, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`جاري التنفيذ\` ]────╮*
> *┤ 🎨┊ يتم تصميم اللوجو...*
> *┤ ⏳┊ انتظر قليلاً*
> *┤────────────···*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
      }, { quoted: m })

      const res = await BrandCrowd(text)

      if (!res || res.length === 0) {
        return sock.sendMessage(chat, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`فشل\` ]────╮*
> *┤ ❌┊ لا توجد نتائج لهذا الاسم*
> *┤────────────···*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
        }, { quoted: m })
      }

      const rdm = res[Math.floor(Math.random() * res.length)]

      // ✨ النتيجة بزينة
      const caption = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`لوجو جاهز\` ]────╮*
> *┤ ✨┊ الاسم: ${text}*
> *┤ 🎨┊ تم إنشاء الشعار بنجاح*
> *┤────────────···*
> *┤ 🚀┊ استمتع بالتصميم!*
> *┤────────────···*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`

      await sock.sendMessage(chat, {
        image: { url: rdm },
        caption
      }, { quoted: m })

    } catch (e) {
      console.error("❌ Logo Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`خطأ\` ]────╮*
> *┤ ⚠️┊ حدث خطأ أثناء التنفيذ*
> *┤ 🔁┊ حاول مرة أخرى لاحقاً*
> *┤────────────···*
> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
      }, { quoted: m })
    }
  }
}

// 🔎 جلب الشعارات
async function BrandCrowd(query) {
  try {
    const res = await fetch(
      'https://www.brandcrowd.com/maker/logos/page1?Text=' +
      encodeURIComponent(query) +
      '&TextChanged=true&SearchText&KeywordChanged=true&LogoStyle=0'
    )

    const html = await res.text()
    const $ = cheerio.load(html)

    let img = []

    $('img').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('dynamic.brandcrowd.com')) {
        img.push(src)
      }
    })

    return img
  } catch (e) {
    console.error("BrandCrowd Error:", e)
    return []
  }
}
