import fetch from 'node-fetch'

export default {
  name: 'تشابه',
  aliases: ['تطقيم', 'ppcouple', 'ppcp'],
  tags: ['internet'],
  help: ['تشابه'],
  description: 'صور تطقيم بين الاصحاب جميلة وفعالة',
  category: 'ق8',
  execute: async (sock, m) => {
    try {
      const chat = m.key.remoteJid

      // 📥 جلب البيانات
      const res = await fetch('https://raw.githubusercontent.com/KazukoGans/database/main/anime/ppcouple.json')
      const data = await res.json()

      const cita = data[Math.floor(Math.random() * data.length)]

      // 🧑 صورة الولد
      const cowo_res = await fetch(cita.cowo)
      if (!cowo_res.ok) throw new Error('Failed to fetch boy image')

      const cowo_buf = await cowo_res.arrayBuffer()
      const cowo_data = Buffer.from(cowo_buf)

      await sock.sendMessage(chat, {
        image: cowo_data,
        caption: '👦 ولـد'
      }, { quoted: m })

      // 👧 صورة البنت
      const cewe_res = await fetch(cita.cewe)
      if (!cewe_res.ok) throw new Error('Failed to fetch girl image')

      const cewe_buf = await cewe_res.arrayBuffer()
      const cewe_data = Buffer.from(cewe_buf)

      await sock.sendMessage(chat, {
        image: cewe_data,
        caption: '👧 بـنـت'
      }, { quoted: m })

    } catch (err) {
      console.error('❌ PPCouple Error:', err)

      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تحميل الصور، حاول مرة أخرى.'
      }, { quoted: m })
    }
  }
}
