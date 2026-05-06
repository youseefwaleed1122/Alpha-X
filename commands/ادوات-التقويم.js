import moment from 'moment-timezone';

export default {
    name: 'التقويم',
    aliases: ['التاريخ', 'تاريخ', 'تقويم'],
    category: 'ق2',
    description: 'عرض التقويم اليومي والشهري وتفاصيل الوقت',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            const tz = 'Africa/Ndjamena'; // المنطقة الزمنية الخاصة بك من Main.js
            const date = moment().tz(tz);

            // 1. استخراج التفاصيل باللغة العربية
            const dayName = date.locale('ar-SA').format('dddd');
            const dayMonth = date.format('D');
            const monthName = date.format('MMMM');
            const year = date.format('YYYY');
            const time = date.format('hh:mm:ss A');

            // 2. حساب التقويم الشهري (شكل بسيط)
            const startOfMonth = date.clone().startOf('month');
            const endOfMonth = date.clone().endOf('month');
            const currentDay = date.date();

            let calendarGrid = "  ح   ن   ث   ر   خ   ج   س\n";
            let days = "";
            
            // إضافة مسافات لبداية الشهر
            for (let i = 0; i < startOfMonth.day(); i++) {
                days += "    ";
            }

            for (let d = 1; d <= endOfMonth.date(); d++) {
                // تظليل اليوم الحالي
                if (d === currentDay) {
                    days += `[${d < 10 ? '0' + d : d}]`;
                } else {
                    days += ` ${d < 10 ? '0' + d : d} `;
                }

                if ((startOfMonth.day() + d) % 7 === 0) {
                    days += "\n";
                }
            }
            calendarGrid += days;

            // 3. التنسيق النهائي
            const calendarText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                                `> *✧────[ \`تقويم النظام\` ]────╮*\n` +
                                `> *┤ 📅┊ اليوم: ${dayName}*\n` +
                                `> *┤ 🗓️┊ التاريخ: ${dayMonth} ${monthName} ${year}*\n` +
                                `> *┤ ⏰┊ الوقت: ${time}*\n` +
                                `> *┤────────────···*\n` +
                                `> *📊┊ تقويم شهر ${monthName}:*\n` +
                                `\`\`\`${calendarGrid}\`\`\`\n` +
                                `> *┤────────────···*\n` +
                                `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(chatJid, { text: calendarText }, { quoted: m });

        } catch (error) {
            console.error("Calendar Error:", error);
            sock.sendMessage(m.key.remoteJid, { text: '❌ | حدث خطأ أثناء عرض التقويم.' });
        }
    }
};
