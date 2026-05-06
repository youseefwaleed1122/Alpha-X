import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'نطق',
    aliases: ['تكلم', 'قول', 'tts'],
    category: 'ق2',
    description: 'تحويل النص إلى بصمة صوتية حقيقية عبر Google TTS',
    execute: async (sock, m, args, ctx) => {
        let text = args.join(' ');
        const chatJid = m.key.remoteJid;

        // دعم الرد على الرسائل
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            text = quoted.conversation || quoted.extendedTextMessage?.text || text;
        }

        if (!text) {
            return sock.sendMessage(chatJid, { text: '❌ | اكتب نصاً أو رد على رسالة لتحويلها إلى صوت.' }, { quoted: m });
        }

        try {
            // إنشاء مجلد temp إذا لم يكن موجوداً
            const tempDir = path.resolve(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const id = crypto.randomBytes(6).toString('hex');
            const mp3Path = path.join(tempDir, `${id}.mp3`);
            const oggPath = path.join(tempDir, `${id}.ogg`);

            // رابط Google TTS المباشر
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;

            // 1. تحميل ملف الـ MP3 من جوجل
            const res = await axios.get(url, { responseType: 'stream' });
            const writer = fs.createWriteStream(mp3Path);
            res.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // 2. تحويل الملف إلى OGG OPUS (ليظهر كبصمة صوتية أصلية)
            await new Promise((resolve, reject) => {
                ffmpeg(mp3Path)
                    .outputOptions([
                        '-c:a libopus',
                        '-b:a 64k',
                        '-vbr on'
                    ])
                    .toFormat('ogg')
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('FFMPEG Error:', err);
                        reject(err);
                    })
                    .save(oggPath);
            });

            // 3. قراءة وإرسال الملف
            if (fs.existsSync(oggPath)) {
                const audioBuffer = fs.readFileSync(oggPath);
                await sock.sendMessage(chatJid, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: m });

                // 4. التنظيف (حذف الملفات المؤقتة)
                fs.unlinkSync(mp3Path);
                fs.unlinkSync(oggPath);
            }

        } catch (e) {
            console.error('TTS ERROR:', e);
            sock.sendMessage(chatJid, { text: '❌ | فشل إنشاء الصوت. تأكد من تثبيت ffmpeg على النظام.' }, { quoted: m });
        }
    }
};
