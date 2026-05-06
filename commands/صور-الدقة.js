import Jimp from 'jimp'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const imageCache = new Map()

const resolutionOptions = [
  { name: '4K (Ultra HD)', width: 3840, height: 2160 },
  { name: '2K (QHD)', width: 2560, height: 1440 },
  { name: '1080p (Full HD)', width: 1920, height: 1080 },
  { name: '720p (HD)', width: 1280, height: 720 },
  { name: '480p (SD)', width: 854, height: 480 },
  { name: '360p', width: 640, height: 360 },
  { name: '144p', width: 256, height: 144 },
]

// 🔥 استخراج الصورة بنفس أسلوب "اظهر"
async function extractImage(m) {
  try {
    const quotedInfo = m.message?.extendedTextMessage?.contextInfo
    const quotedMsg = quotedInfo?.quotedMessage

    if (!quotedMsg) return null

    const viewOnce =
      quotedMsg.viewOnceMessageV2?.message ||
      quotedMsg.viewOnceMessage?.message ||
      quotedMsg

    const type = Object.keys(viewOnce)[0]
    const media = viewOnce[type]

    if (type !== 'imageMessage') return null

    const stream = await downloadContentFromMessage(media, 'image')

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
  } catch {
    return null
  }
}

export default {
  name: 'الدقة',
  aliases: ['دقة'],
  tags: ['tools'],
  help: ['الدقة', 'الدقة <رقم>'],
  description: 'عدل على جودة صورك حتى HD الى 4K',
  category: 'ق8',

  execute: async (sock, m, args) => {
    try {
      const chat = m.key.remoteJid
      const userId = m.key.participant || m.key.remoteJid

      let imgBuffer = await extractImage(m)

      // ────────────────[عرض القائمة]────────────────
      if (!args.length && imgBuffer) {
        imageCache.set(userId, imgBuffer)

        let menu = '⚙️ اختر الدقة:\n\n'
        resolutionOptions.forEach((res, i) => {
          menu += `${i + 1}. ${res.name}\n`
        })

        menu += '\n💡 مثال:\n.الدقة 3'

        return sock.sendMessage(chat, {
          image: imgBuffer,
          caption: menu
        }, { quoted: m })
      }

      // ────────────────[تنفيذ التحويل]────────────────
      if (args.length) {
        const index = parseInt(args[0]) - 1
        const selectedRes = resolutionOptions[index]

        if (!selectedRes) {
          return sock.sendMessage(chat, {
            text: '❌ اختيار غير صحيح.'
          }, { quoted: m })
        }

        if (!imgBuffer) {
          imgBuffer = imageCache.get(userId)
        }

        if (!imgBuffer) {
          return sock.sendMessage(chat, {
            text: '❌ رد على صورة أولاً.'
          }, { quoted: m })
        }

        await sock.sendMessage(chat, {
          text: `⏳ جاري التحويل إلى ${selectedRes.name}...`
        }, { quoted: m })

        const image = await Jimp.read(imgBuffer)

        image.resize(selectedRes.width, Jimp.AUTO)

        const out = await image.getBufferAsync(Jimp.MIME_JPEG)
        const sizeInMB = (out.length / (1024 * 1024)).toFixed(2)

        await sock.sendMessage(chat, {
          document: out,
          mimetype: 'image/jpeg',
          fileName: 'resolution.jpg',
          caption: `✅ تم التحويل إلى ${selectedRes.name}\n📦 الحجم: ${sizeInMB} MB`
        }, { quoted: m })

        imageCache.delete(userId)
        return
      }

      // ────────────────[بدون صورة]────────────────
      return sock.sendMessage(chat, {
        text: '❌ يرجى الرد على صورة.'
      }, { quoted: m })

    } catch (e) {
      console.log('❌ Resolution Error:', e)
      await sock.sendMessage(m.key.remoteJid, {
        text: '⚠️ حدث خطأ أثناء المعالجة.'
      }, { quoted: m })
    }
  }
}
