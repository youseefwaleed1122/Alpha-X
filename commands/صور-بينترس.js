import axios from "axios"
import { generateWAMessageContent, generateWAMessageFromContent, proto } from "@whiskeysockets/baileys"

const base = "https://www.pinterest.com"
const search = "/resource/BaseSearchResource/get/"

const headers = {
  accept: "application/json, text/javascript, */*; q=0.01",
  referer: "https://www.pinterest.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "x-app-version": "a9522f",
  "x-pinterest-appstate": "active",
  "x-pinterest-pws-handler": "www/[username]/[slug].js",
  "x-requested-with": "XMLHttpRequest",
}

// 🍪 كوكيز
async function getCookies() {
  const res = await axios.get(base)
  return res.headers["set-cookie"]
    .map(v => v.split(";")[0])
    .join("; ")
}

// 🔎 البحث
async function searchPinterest(query) {
  const cookies = await getCookies()

  const params = {
    source_url: `/search/pins/?q=${query}`,
    data: JSON.stringify({
      options: {
        query,
        scope: "pins",
        bookmarks: [""],
        page_size: 10,
      },
      context: {},
    }),
    _: Date.now(),
  }

  const { data } = await axios.get(base + search, {
    headers: { ...headers, cookie: cookies },
    params,
  })

  const results = data.resource_response.data.results.filter(
    v => v.images?.orig?.url
  )

  return results.slice(0, 10).map(v => v.images.orig.url)
}

export default {
  name: "صور",
  aliases: ["pin", "صور", "بين", "صوره-بين"],
  tags: ["downloader"],
  help: ["pinterest <بحث>"],
  description: 'حمل اكتر من عشر صور بسرعة وسهولة',
  category: 'ق8',

  execute: async (sock, m, args, { cfg }) => {
    try {
      const chat = m.key.remoteJid
      const text = args.join(" ")

      if (!text) {
        return sock.sendMessage(chat, {
          text: `مثال:\n.pinterest anime`
        }, { quoted: m })
      }

      await sock.sendMessage(chat, {
        text: "🔎 جاري البحث ..."
      }, { quoted: m })

      const images = await searchPinterest(text)

      if (!images.length) {
        return sock.sendMessage(chat, {
          text: "❌ لا توجد نتائج"
        }, { quoted: m })
      }

      // 📸 إنشاء صورة
      async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent(
          { image: { url } },
          { upload: sock.waUploadToServer }
        )
        return imageMessage
      }

      let cards = []
      let i = 1

      for (let img of images) {
        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `📸 صورة رقم ${i++}`,
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: cfg.botName || "BOT",
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: await createImage(img),
          }),
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📢 قناة البوت",
                    url: "https://whatsapp.com/channel/0029VbAuG5h2ZjCvTamnRq1o",
                  }),
                },
              ],
            }),
        })
      }

      // 📦 إنشاء الكاروسيل
      const msg = generateWAMessageFromContent(
        chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: { text: "🖼️ نتائج البحث" },
                footer: { text: cfg.botName || "BOT" },
                carouselMessage: { cards },
              }),
            },
          },
        },
        {}
      )

      await sock.relayMessage(chat, msg.message, {
        messageId: msg.key.id,
      })

    } catch (e) {
      console.log("❌ Pinterest Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        text: "❌ حدث خطأ أثناء البحث."
      }, { quoted: m })
    }
  }
}
