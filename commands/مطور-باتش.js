import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    name: 'باتش',
    aliases: ['باتش'],
    category: 'ق3',
    description: 'إدارة ملفات البلجنات',
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

            const pluginsDir = path.join(__dirname)
            const sub = args[0]?.toLowerCase()
            const target = args[1]

            /* ===== المساعدة ===== */
            if (!sub) {
                await sock.sendMessage(chatJid, {
                    text: `📌 أوامر الباتش:\n.باتش عرض\n.باتش عرض <اسم>\n.باتش اضف <اسم>\n.باتش حذف <اسم>`
                }, { quoted: m })
                return true
            }

            /* ===== عرض جميع الملفات ===== */
            if (sub === 'عرض' && !target) {
                const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
                const list = files.map((f, i) => `┃ ${i + 1}- ${f}`).join('\n')
                await sock.sendMessage(chatJid, {
                    text: `┏━⬦ قائمة البلجنات:\n${list}\n┃\n┗━⬦ المجموع: ${files.length} ملفات`
                }, { quoted: m })
                return true
            }

            if (!target) {
                await sock.sendMessage(chatJid, {
                    text: '❌ حدد اسم الملف.'
                }, { quoted: m })
                return false
            }

            const fileName = target.endsWith('.js') ? target : `${target}.js`
            const fullPath = path.join(pluginsDir, fileName)

            /* ===== عرض ملف ===== */
            if (sub === 'عرض') {
                if (!fs.existsSync(fullPath)) {
                    await sock.sendMessage(chatJid, {
                        text: `❌ الملف غير موجود: ${fileName}`
                    }, { quoted: m })
                    return false
                }
                await sock.sendMessage(chatJid, {
                    text: `📂 ${fileName}:\n\n${fs.readFileSync(fullPath, 'utf8')}`
                }, { quoted: m })
                return true
            }

            /* ===== حذف ملف ===== */
            if (sub === 'حذف') {
                if (!fs.existsSync(fullPath)) {
                    await sock.sendMessage(chatJid, {
                        text: `❌ الملف غير موجود: ${fileName}`
                    }, { quoted: m })
                    return false
                }
                fs.unlinkSync(fullPath)
                await sock.sendMessage(chatJid, {
                    text: `✅ تم حذف الملف: ${fileName}`
                }, { quoted: m })
                return true
            }

            /* ===== إضافة / استبدال ===== */
            if (sub === 'اضف') {
                const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                const code = quoted?.conversation || quoted?.extendedTextMessage?.text || ''

                if (!code.trim()) {
                    await sock.sendMessage(chatJid, {
                        text: '❌ لم أجد كود في الرسالة المقتبسة.\n📌 رد على رسالة الكود.'
                    }, { quoted: m })
                    return false
                }

                fs.writeFileSync(fullPath, `${code.trim()}\n`, 'utf8')
                await sock.sendMessage(chatJid, {
                    text: `✅ تم حفظ الكود في: ${fileName}`
                }, { quoted: m })
                return true
            }

            /* ===== أمر غير معروف ===== */
            await sock.sendMessage(chatJid, {
                text: '❌ أمر غير معروف.'
            }, { quoted: m })
            return false

        } catch (error) {
            console.error("❌ Error in Batch Command:", error)
        }
    }
}