export default {
    name: 'تعديل',
    aliases: [
        'on', 'off', 'تفعيل', 'تعطيل', 'تشغيل', 'ايقاف',
        // ✅ أسماء الميزات مباشرة
        'الترقية', 'الترحيب', 'التغيرات', 'ايموجي',
        'القبول', 'الروابط', 'الشتائم', 'الإسبام',
        'الوهمية', 'الردود', 'الخاص'
    ],
    description: 'امر لتعطيل وتفعيل المزايا',
    execute: async (sock, m, args, ctx) => {
        try {
            const { db } = ctx;
            const chatJid = m.key.remoteJid;

            const fullText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            const parts = fullText.trim().replace(/^[.!#\/]/, '').split(/\s+/);
            const cmdUsed = parts[0].toLowerCase();
            const arg1 = parts[1]?.toLowerCase() || '';

            // ✅ خريطة ميزات الجروب (chats)
            const chatFeatures = {
                'الترقية': 'autolevel',
                'الترحيب': 'welcome',
                'التغيرات': 'detect',
                'الايموجي': 'react',
                'القبول': 'aceptar',
               //الحماية
                 'الروابط': 'antilink',
                'الشتائم': 'antiswear',
                'الإسبام': 'antispam',
                'الوهمية': 'antifake'
            };

            // ✅ خريطة ميزات البوت العامة (settings)
            const botFeatures = {
                'الردود': 'responses',
                'الخاص': 'private',
            };

            // جميع الميزات مجمعة
            const allFeatures = { ...chatFeatures, ...botFeatures };

            // كلمات التفعيل والتعطيل
            const enableWords = ['on', 'تفعيل', 'تشغيل'];
            const disableWords = ['off', 'تعطيل', 'ايقاف'];
            const toggleWord = 'تعديل';

            // ============================
            // 📌 تحديد اسم الميزة والأمر
            // ============================
            let featureName = null;
            let action = null;

            // حالة: .تفعيل الترقية أو .on الترقية
            if (enableWords.includes(cmdUsed) || disableWords.includes(cmdUsed)) {
                featureName = arg1;
                action = enableWords.includes(cmdUsed) ? 'enable' : 'disable';

            // حالة: .تعديل الترقية أو .تعديل تفعيل/تعطيل
            } else if (cmdUsed === toggleWord) {
                if (arg1 === 'تفعيل' || arg1 === 'تعطيل') {
                    const isEnable = arg1 === 'تفعيل';
                    if (chatJid.endsWith('@g.us') && db.data.chats[chatJid]) {
                        for (const key of Object.values(chatFeatures)) {
                            db.data.chats[chatJid][key] = isEnable;
                        }
                    }
                    for (const key of Object.values(botFeatures)) {
                        db.data.settings[key] = isEnable;
                    }
                    db.save();
                    const statusEmoji = isEnable ? '✅' : '❌';
                    return await sock.sendMessage(chatJid, {
                        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐂𝐎𝐍𝐅𝐈𝐆~ 〕⌬ ╄╾ ━\n\n> *┤ ${statusEmoji} تم ${arg1} جميع المزايا بنجاح*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
                    }, { quoted: m });
                }
                featureName = arg1;
                action = 'toggle';

            // حالة: .الترقية on أو .الترقية off أو .الترقية تعديل أو .الترقية فقط
            } else if (allFeatures[cmdUsed]) {
                featureName = cmdUsed;
                if (enableWords.includes(arg1)) {
                    action = 'enable';
                } else if (disableWords.includes(arg1)) {
                    action = 'disable';
                } else if (arg1 === toggleWord) {
                    action = 'toggle';
                } else {
                    action = 'status';
                }
            }

            // ============================
            // 📌 عرض القائمة
            // ============================
            if (!featureName && cmdUsed === toggleWord) {
                const isGroup = chatJid.endsWith('@g.us');
                const groupConfig = isGroup ? (db.data.chats[chatJid] || {}) : {};
                const settings = db.data.settings || {};

                const chatList = Object.entries(chatFeatures).map(([name, key]) => {
                    const status = groupConfig[key] ? '🟢' : '🔴';
                    return `┤ ${status} ${name}`;
                }).join('\n> *');

                const botList = Object.entries(botFeatures).map(([name, key]) => {
                    const status = settings[key] ? '🟢' : '🔴';
                    return `┤ ${status} ${name}`;
                }).join('\n> *');

                return await sock.sendMessage(chatJid, {
                    text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐂𝐎𝐍𝐅𝐈𝐆~ 〕⌬ ╄╾ ━\n\n> *✧────[ مزايا الجروب ]────╮*\n> *${chatList}*\n> *┤────────────···*\n> *✧────[ مزايا البوت ]────╮*\n> *${botList}*\n> *┤────────────···*\n> *💡 مثال: .تفعيل الترقية*\n> *💡 أو: .الترقية on*\n> *💡 لتفعيل الكل: .تعديل تفعيل*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
                }, { quoted: m });
            }

            // ============================
            // 📌 تحديد مصدر الميزة
            // ============================
            if (!featureName || !allFeatures[featureName]) {
                return await sock.sendMessage(chatJid, {
                    text: `> ⚠️ *الميزة غير موجودة*\n> اكتب *.تعديل* لعرض قائمة المزايا`
                }, { quoted: m });
            }

            const isChatFeature = !!chatFeatures[featureName];

            if (isChatFeature && !chatJid.endsWith('@g.us')) {
                return await sock.sendMessage(chatJid, {
                    text: '⚠️ هذه الميزة مخصصة للمجموعات فقط.'
                }, { quoted: m });
            }

            const targetKey = allFeatures[featureName];
            const targetData = isChatFeature ? db.data.chats[chatJid] : db.data.settings;

            // ============================
            // 📌 عرض الحالة فقط
            // ============================
            if (action === 'status') {
                const currentStatus = targetData[targetKey];
                return await sock.sendMessage(chatJid, {
                    text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐂𝐎𝐍𝐅𝐈𝐆~ 〕⌬ ╄╾ ━\n\n> *┤ الميزة: ${featureName}*\n> *┤ الحالة: ${currentStatus ? 'نشط 🟢' : 'متوقف 🔴'}*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
                }, { quoted: m });
            }

            // ============================
            // 📌 تطبيق التغيير
            // ============================
            let isEnable;
            if (action === 'enable') isEnable = true;
            else if (action === 'disable') isEnable = false;
            else isEnable = !targetData[targetKey];

            targetData[targetKey] = isEnable;
            db.save();

            const statusEmoji = isEnable ? '✅' : '❌';
            const statusWord = isEnable ? 'تفعيل' : 'تعطيل';

            await sock.sendMessage(chatJid, {
                text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐂𝐎𝐍𝐅𝐈𝐆~ 〕⌬ ╄╾ ━\n\n> *┤ ${statusEmoji} تم ${statusWord} الميزة بنجاح*\n> *┤ الميزة: ${featureName}*\n> *┤ الحالة الآن: ${isEnable ? 'نشط 🟢' : 'متوقف 🔴'}*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Config Command Error:", error);
        }
    }
};