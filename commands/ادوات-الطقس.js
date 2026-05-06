import axios from 'axios';

export default {
    name: 'الطقس',
    aliases: ['طقس', 'weather'],
    category: 'ق2',
    description: 'عرض حالة الطقس في مدينة معينة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            const city = args.join(' ');

            if (!city) {
                return sock.sendMessage(chatJid, { 
                    text: `⚠️ | يرجى كتابة اسم المدينة بعد الأمر.\nمثال: ${ctx.cfg.prefix}الطقس القاهرة` 
                }, { quoted: m });
            }

            // رابط الـ API الخاص بك
            const apiKey = '060a6bcfa19809c2cd4d97a212b19273';
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ar&appid=${apiKey}`;

            const response = await axios.get(url);
            const data = response.data;

            // استخراج البيانات
            const cityName = data.name;
            const country = data.sys.country;
            const temp = Math.round(data.main.temp);
            const feelsLike = Math.round(data.main.feels_like);
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const description = data.weather[0].description;

            // أيقونة الحالة الجوية (اختياري بناءً على الوصف)
            let emoji = '🌡️';
            if (description.includes('صافي')) emoji = '☀️';
            if (description.includes('سحب')) emoji = '☁️';
            if (description.includes('مطر')) emoji = '🌧️';
            if (description.includes('رعد')) emoji = '⛈️';

            // التنسيق النهائي
            const weatherText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                                `> *✧────[ \`حالة الطقس\` ]────╮*\n` +
                                `> *┤ 🏙️┊ المدينة: ${cityName}, ${country}*\n` +
                                `> *┤ ${emoji}┊ الحالة: ${description}*\n` +
                                `> *┤ 🌡️┊ الحرارة: ${temp}°C*\n` +
                                `> *┤ 🧊┊ شعور حقيقي: ${feelsLike}°C*\n` +
                                `> *┤ 💧┊ الرطوبة: ${humidity}%*\n` +
                                `> *┤ 💨┊ الرياح: ${windSpeed} m/s*\n` +
                                `> *┤────────────···*\n` +
                                `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { text: weatherText }, { quoted: m });

        } catch (error) {
            console.error("Weather Error:", error.message);
            if (error.response && error.response.status === 404) {
                return sock.sendMessage(m.key.remoteJid, { text: '❌ | عذراً، لم أتمكن من العثور على هذه المدينة. تأكد من الاسم الصحيح.' }, { quoted: m });
            }
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ أثناء جلب بيانات الطقس.' });
        }
    }
};
