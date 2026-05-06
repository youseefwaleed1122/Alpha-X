import { search, download } from 'aptoide-scraper'

export default {
  name: 'تطبيق',
  aliases: ['تطبيقات', 'apk', 'aptoide', 'modapk'],
  category: 'تحميل',
  description: 'بحث وتحميل تطبيقات APK',
  category: 'ق10',

  execute: async (sock, m, args) => {
    try {
      const jid = m.key.remoteJid
      const text = args.join(' ').trim()

      if (!text) {
        return sock.sendMessage(jid, {
          text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

❀ اكتب اسم التطبيق`
        }, { quoted: m })
      }

      const parts = text.split(' ')
      const isDownload = parts[0] === 'تنزيل'
      const packageName = parts.slice(1).join(' ')

      /* =========================
         📥 حالة التحميل
      ========================= */
      if (isDownload && packageName) {
        await sock.sendMessage(jid, {
          react: { text: '🕒', key: m.key }
        })

        try {
          const data = await download(packageName)

          if (data.size?.includes('GB') || parseFloat(data.size) > 900) {
            return sock.sendMessage(jid, {
              text: '⚠️ حجم التطبيق كبير ولا يمكن إرساله.'
            }, { quoted: m })
          }

          await sock.sendMessage(jid, {
            document: { url: data.dllink },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${data.name}.apk`
          }, { quoted: m })

          await sock.sendMessage(jid, {
            react: { text: '✔️', key: m.key }
          })

        } catch (e) {
          console.log("Download error:", e)

          await sock.sendMessage(jid, {
            react: { text: '❌', key: m.key }
          })

          return sock.sendMessage(jid, {
            text: '❌ فشل تنزيل التطبيق.'
          }, { quoted: m })
        }

        return
      }

      /* =========================
         🔎 البحث
      ========================= */
      await sock.sendMessage(jid, {
        react: { text: '🔍', key: m.key }
      })

      let results
      try {
        results = await search(text)
      } catch {
        return sock.sendMessage(jid, {
          text: '❌ فشل البحث.'
        }, { quoted: m })
      }

      if (!results || results.length === 0) {
        return sock.sendMessage(jid, {
          text: '❌ لا توجد نتائج.'
        }, { quoted: m })
      }

      results = results.slice(0, 5)

      /* =========================
         📦 تجهيز النتائج
      ========================= */
      let rows = []

      for (let i = 0; i < results.length; i++) {
        try {
          const info = await download(results[i].id)

          rows.push({
            title: info.name,
            description: `📦 الحجم: ${info.size}`,
            id: `تطبيق تنزيل ${results[i].id}`
          })

        } catch {
          rows.push({
            title: results[i].name,
            description: `📦 الحجم: غير معروف`,
            id: `تطبيق تنزيل ${results[i].id}`
          })
        }
      }

      /* =========================
         📄 الإرسال
      ========================= */
      const textMenu = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

📦 نتائج البحث:
🔎 ${text}
📊 عدد النتائج: ${rows.length}

اختر التطبيق الذي تريد تحميله`

      await sock.sendMessage(jid, {
        text: textMenu,
        footer: '𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃',
        buttons: [
          {
            buttonId: 'select',
            buttonText: { displayText: '📲 اختيار تطبيق' },
            type: 1
          }
        ],
        sections: [
          {
            title: '📂 التطبيقات',
            rows
          }
        ]
      }, { quoted: m })

    } catch (e) {
      console.log("❌ Aptoide Error:", e)

      await sock.sendMessage(m.key.remoteJid, {
        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

⚠️ حدث خطأ أثناء تنفيذ الأمر`
      }, { quoted: m })
    }
  }
}
