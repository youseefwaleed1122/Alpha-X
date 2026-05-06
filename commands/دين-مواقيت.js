import axios from 'axios';

const FLAGS = {
    'السعودية': '🇸🇦', 'مصر': '🇪🇬', 'المغرب': '🇲🇦', 'الجزائر': '🇩🇿',
    'تونس': '🇹🇳', 'الكويت': '🇰🇼', 'الإمارات': '🇦🇪', 'قطر': '🇶🇦',
    'عمان': '🇴🇲', 'لبنان': '🇱🇧', 'سوريا': '🇸🇾', 'اليمن': '🇾🇪',
    'العراق': '🇮🇶', 'الأردن': '🇯🇴', 'فلسطين': '🇵🇸', 'تشاد': '🇹🇩',
    'أنجمينا': '🇹🇩', 'أفريقيا الوسطى': '🇨🇫', 'ليبيا': '🇱🇾', 'السودان': '🇸🇩'
};

export default {
    name: 'مواقيت',
    aliases: ['صلاة', 'الصلاة', 'وقت'],
    category: 'ق5',
    description: 'عرض مواقيت الصلاة لمدينة معينة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            let city = args.join(' ').trim();

            if (!city) {
                return sock.sendMessage(chatJid, { 
                    text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                          `⚠️ *الاستخدام الصحيح:* \n` +
                          `\`${ctx.cfg.prefix}مواقيت <اسم المدينة>\`\n\n` +
                          `✧ مثال:\n` +
                          `\`${ctx.cfg.prefix}مواقيت أنجمينا\`\n` +
                          `\`${ctx.cfg.prefix}مواقيت القاهرة\``
                }, { quoted: m });
            }

            // تحديد الدولة تلقائياً (افتراضياً تشاد أو السعودية بناءً على الاسم)
            let country = ''; 
            if (/تشاد|أنجمينا|ندجامينا/i.test(city)) country = 'TD';
            if (/مصر|قاهرة|إسكندرية/i.test(city)) country = 'EG';

            const res = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
                params: { city, country, method: 4 }
            });

            const data = res.data.data.timings;
            const dateInfo = res.data.data.date;

            // تحديد العلم
            let flag = '🏳️';
            for (let key in FLAGS) {
                if (city.includes(key)) {
                    flag = FLAGS[key];
                    break;
                }
            }

            const prayerText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                               `> *✧────[ 🕌 مواقيت الصلاة ]────╮*\n` +
                               `> *📍 المدينة:* 『 ${city} ${flag} 』\n` +
                               `> *📅 التاريخ:* ${dateInfo.hijri.day} ${dateInfo.hijri.month.ar} ${dateInfo.hijri.year}هـ\n` +
                               `> *┤────────────···*\n` +
                               `> *✨ الفجر:* ${data.Fajr}\n` +
                               `> *🌅 الشروق:* ${data.Sunrise}\n` +
                               `> *🕌 الظهر:* ${data.Dhuhr}\n` +
                               `> *🕒 العصر:* ${data.Asr}\n` +
                               `> *🌇 المغرب:* ${data.Maghrib}\n` +
                               `> *🌙 العشاء:* ${data.Isha}\n` +
                               `> *┤────────────···*\n` +
                               `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { text: prayerText }, { quoted: m });

        } catch (error) {
            console.error("Prayer Times Error:", error);
            sock.sendMessage(m.key.remoteJid, { 
                text: '❌ | لم أتمكن من العثور على مواقيت لهذه المدينة. تأكد من كتابة الاسم بشكل صحيح.' 
            });
        }
    }
};
