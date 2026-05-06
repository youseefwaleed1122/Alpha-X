import chalk from 'chalk';

export default async function (sock, m, ctx) {
    try {
        const { db } = ctx;

        // 1. تحديد المعرفات الأساسية (دعم الأحداث والرسائل العادية)
        const isGroupUpdate = !!m.isGroupUpdate; // أضف هذا السطر هنا
        const isStub = !!m.messageStubType;     // أضف هذا السطر هنا

        const id = isGroupUpdate ? (m.id || m.jid) : m.key?.remoteJid;
        if (!id || !id.endsWith('@g.us')) return;
        
        // تحديد المرسل (مهم جداً لنظام الكتم والـ XP)
        const senderJid = isGroupUpdate ? 
            (m.author || m.participants?.[0] || id) : 
            (m.key?.participant || m.participant || id);

        const groupConfig = db.data.chats[id] || {};
        const user = db.data.users[senderJid] || {}; // تعريف الـ user مرة واحدة للملف بالكامل

        // ==========================================
        // 1. [ نظام الترحيب والتوديع التلقائي ]
        // ==========================================
        const action = m.action; 
        const participants = m.participants;

        if (action && groupConfig.welcome === true) {
            // --- حالة دخول عضو جديد ---
            if (action === 'add' && participants) {
                for (let jid of participants) {
                    let welcomeText = `> ━ ╼╃ ⌬〔 ~𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎~〕⌬ ╄╾ ━
> *⋅ ───━ •﹝﹞• ━─── ⋅*
> *┤🔖┊المنـشـن ⟦ @${jid.split('@')[0]} ⟧*
> *⋅ ───━ •﹝﹞• ━─── ⋅*
> *┤────────────···*
> *┤ أهلاً بك مجتمعنا الرائع*
> *┤ هنا تجد المعرفة والمتعة*
> *┤ تنورنا بقدومك ونبنهج بك*
> *┤ نرجو احترام قوانيننا وقرائتها*
> *┤ عدم التدخل بشؤون الآخرين*
> *┤ ولا تحاول تحتك بغيرك*
> *┤ كون صداقات ولا تخدع الناس*
> *┤ ومرة أخرى اهلا وسهلا بك بيننا*
> *┤────────────···*

> ~*أدخـل فـرع الـإعــ❦ـلانـات*~
> https://chat.whatsapp.com/Ik6B5Drw90CB0AOWZhUnbD?mode=gi_t

> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷 𝚇 𝙱𝙾𝚃`;
                    await sock.sendMessage(id, { text: welcomeText, mentions: [jid] });
                }
            } 
            // --- حالة خروج أو طرد عضو ---
            else if (action === 'remove' && participants) {
                for (let jid of participants) {
                    let goodbyeText = `> ━ ╼╃ ⌬〔 ~𝐆𝐎𝐎𝐃𝐁𝐘𝐄 𝐅𝐑𝐎𝐌 𝐔𝐒~〕⌬ ╄╾ ━  
> ⋅ ───━ •﹝﹞• ━─── ⋅  
> ┤👋┊تـوديـع ⟦ @${jid.split('@')[0]} ⟧  
> ⋅ ───━ •﹝﹞• ━─── ⋅  
> ┤────────────···  
> ┤ نشكرك على وقتك معنا  
> ┤ نأمل أنك استمتعت بوجودك بيننا  
> ┤ وجودك كان إضافة جميلة للمجتمع  
> ┤ نتمنى لك التوفيق في رحلتك القادمة  
> ┤ لا تنسَ أنك دائمًا مرحب بك إن عدت  
> ┤ ابقَ بخير وحقق أحلامك  
> ┤ إلى اللقاء قريبًا بإذن الله  
> ┤────────────···  

> ~أراك قريبًا بإذن الله~  

> ⋅ ───━ •﹝♦﹞• ━─── ⋅  
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷 𝚇 𝙱𝙾𝚃`;
                    await sock.sendMessage(id, { text: goodbyeText, mentions: [jid] });
                }
            }
        }

        // ==========================================
        // 2. [ نظام ALPHA X - القبول التلقائي ]
        // ==========================================
        if (groupConfig.aceptar === true) {
            try {
                const requests = await sock.groupRequestParticipantsList(id);
                if (requests && requests.length > 0) {
                    const jids = requests.map(r => r.jid);
                    await sock.groupRequestParticipantsUpdate(id, jids, 'approve');
                    await sock.sendMessage(id, {
                        text: `> ✅ *[ ALPHA X ]* تم قبول (${jids.length}) طلب انضمام معلق تلقائياً.`,
                        mentions: jids
                    });
                }
            } catch (err) { /* خطأ صامت */ }
        }

        // ==========================================
        // 3. [ نظام كاشف التغييرات - ALPHA X DETECTOR ]
        // ==========================================
        if (m.isGroupUpdate && groupConfig.detect === true) {
            const author = m.author || m.participants?.[0] || 'Unknown';
            const getMention = (jid) => `@${jid.split('@')[0]}`;
            
            // أ. ترقية أدمن
            if (m.action === 'promote') {
                for (let jid of m.participants) {
                    await sock.sendMessage(id, {
                        text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ 👑┊ تم ترقيته ${getMention(jid)} كأدمن*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(author)}❫*\n> *┤ 🎉┊مبروك الترقية*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                        mentions: [jid, author]
                    });
                }
            }
            // ب. إعفاء أدمن
            else if (m.action === 'demote') {
                for (let jid of m.participants) {
                    await sock.sendMessage(id, {
                        text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ 👑┊ تم اعفائه ${getMention(jid)} من رتبته*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(author)}❫*\n> *┤ 🧳┊للأسف تم إعفاءك*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                        mentions: [jid, author]
                    });
                }
            }
            // ج. تغيير الاسم
            if (m.subject) {
                await sock.sendMessage(id, {
                    text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ 📛┊ تم تغيير اسم المجموعة*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(author)}❫*\n> *┤ 📝┊ الاسم الجديد: ${m.subject}*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                    mentions: [author]
                });
            }
            // د. تغيير الوصف
            if (m.desc) {
                await sock.sendMessage(id, {
                    text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ 📜┊ تم تغيير وصف المجموعة*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(author)}❫*\n> *┤ 👁️‍🗨️┊يمكنك رؤية الوصف الجديد*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                    mentions: [author]
                });
            }
            // هـ. تغيير الإعدادات
            if (m.announce !== undefined || m.restrict !== undefined) {
                const setting = m.announce !== undefined ? 'إرسال الرسائل' : 'تعديل معلومات المجموعة';
                const newState = (m.announce === true || m.restrict === true) ? 'مغلق (للمشرفين)' : 'مفتوح (للجميع)';
                await sock.sendMessage(id, {
                    text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ ⚙️┊ تم تغيير اعدادات المجموعة*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(author)}❫*\n> *┤ 🔩┊ الإعداد الجديد ↶*\n> *┤ 🆕┊ ${setting}: ${newState}*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                    mentions: [author]
                });
            }
                        // و. تغيير الصورة (دعم طريقتين: التحديث المباشر ورسائل النظام)
            const isPictureUpdate = 
                (m.action === 'modify' && m.announce === undefined && !m.subject && !m.desc) || 
                (m.messageStubType === 6 || m.messageStubType === 41); 
                // 6 و 41 هي الأكواد البرمجية لتغيير صورة المجموعة في واتساب

            if (isPictureUpdate) {
                // محاولة جلب الفاعل من رسالة النظام إذا كان التحديث عبر StubType
                const picAuthor = m.author || (m.messageStubParameters && m.messageStubParameters[0]) || author;

                await sock.sendMessage(id, {
                    text: `> *✧───[ \`الــكــاشــف\`  ]───╮*\n> *┤ 📷┊ تم تغيير صورة المجموعة*\n> *┤ 👤┊ بواسطة↜ ❪${getMention(picAuthor)}❫*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                    mentions: [picAuthor]
                });
            }
       }


                // ==========================================
        // 4. [ نظام الترقية والـ XP ]
        // ==========================================
        // لا يعمل النظام إذا كان الحدث عبارة عن تحديث مجموعة أو رسالة نظام
        if (isGroupUpdate || isStub) return;

        // حذفنا سطر const senderJid لأننا عرفناه في بداية الملف
        if (!db.data.users[senderJid]) return;

        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const isCommand = ['.', '!', '#', '/'].some(p => text.startsWith(p));

        
        const xpToAdd = isCommand ? 10 : 2;
        user.exp = (user.exp || 0) + xpToAdd;

        const getXpForLevel = (level) => (level <= 0) ? 0 : 100 * level + 5 * level * (level - 1);
        
        let beforeLevel = user.level || 0;
        let currentLevel = beforeLevel;
        while (user.exp >= getXpForLevel(currentLevel + 1)) { currentLevel++; }

        if (currentLevel > beforeLevel) {
            user.level = currentLevel;
            const getRole = (lvl) => {
                if (lvl >= 90) return 'S+';
                if (lvl >= 75) return 'S';
                if (lvl >= 60) return 'A';
                if (lvl >= 45) return 'B';
                if (lvl >= 30) return 'C';
                if (lvl >= 15) return 'D';
                return 'E';
            };
            user.role = getRole(currentLevel);

            if (groupConfig.autolevel === true) {
                const currentLevelThreshold = getXpForLevel(user.level);
                const nextLevelThreshold = getXpForLevel(user.level + 1);
                const neededForNext = nextLevelThreshold - currentLevelThreshold;

                const response = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━
>
> *✧───[ \`ترقية المستوى\` ]───╮*
> *┤ 👤┊ المستخدم: ${m.pushName || 'User'}*
> *┤ 🎖️┊ الرتبة: ${user.role}*
> *┤────────────···*
> *✧────[ \`المستوى\` ]────╮*
> *┤ 🎯┊ المستوى: ${beforeLevel} ⇢ ${user.level}*
> *┤────────────···*
> *✧────[ \`مبروك\` ]────╮*
> *┤ 🎉┊ تم ترقيتك للمستوى الجديد*
> *┤ 🚀┊ المستوى القادم يتطلب ${neededForNext}xp*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷 𝚇 𝙱𝙾𝚃`;

                await sock.sendMessage(id, { text: response, mentions: [senderJid] }, { quoted: m });
                db.save();
            }
        }
        
                              // ==========================================
        // 5. [ نظام التفاعل التلقائي - ALPHA X REACT ]
        // ==========================================
        
        // لا نستخدم const هنا لأننا عرفناها سابقاً في أعلى الملف
        // فقط نستخدم القيمة الموجودة في isStub التي تم تعريفها في البداية
        
        if (groupConfig.react === true && !m.key.fromMe && !m.isGroupUpdate && !isStub) {
            
            const emojis = [
"😺","😸","😹","😻","😼","😽","🙀","😿","😾","🤩","😏","😳","🙈","🙉","🙊","🤯","😱","😨","😰","🤫",
"🥴","🤧","🤠","🤏🏻","🤝","💪","👑","😚","🥂","😈","☺️","😊","😁","😂","🤣","😅","😆","😉","😍","😘",
"😗","😙","😛","😜","🤪","🤨","🧐","🤓","😎","🥸","🤡","👻","💀","☠️","👽","🤖","🎃","😺","😸","😹",
"😻","😼","😽","🙀","😿","😾","💗","💞","💕","💓","💖","💘","💝","❤️","🧡","💛","💚","💙","💜","🖤",
"🤍","🤎","💋","🫦","👀","🧸","🎁","🎉","🎊","🥳","✨","🌟","⭐","🌈","🪐","⚡","💥","🔥","🌊","💧",
"💎","🧿","🪄","🎯","🎮","🎧","📱","💻","⌨️","🖥️","🖱️","📸","📷","🎥","📺","📡","📻","🔋","🔌","💡",
"🕯️","🪔","📚","📖","📝","📌","📍","📎","✂️","📏","📐","📦","📫","📬","📭","📮","🗑️","🔒","🔓","🔑",
"🛡️","⚙️","🔧","🔨","🧰","⚔️","🔫","💣","🪓","🗡️","⚖️","🧪","🧬","🧫","🔬","🔭","📊","📈","📉","📅",
"📆","⏰","⌛","⏳","🕰️","🌍","🌎","🌏","🌐","🗺️","🏝️","🏜️","🏔️","⛰️","🌋","🏕️","🏠","🏡","🏢","🏬",
"🏭","🏦","🏨","🏪","🏫","🏩","💒","🏛️","⛪","🕌","🛕","🕍","🗼","🗽","🎡","🎢","🎠","🚗","🚕","🚙",
"🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🚚","🚛","🚜","🛵","🏍️","🚲","✈️","🛫","🛬","🚀","🛸","🚁","⛵",
"🚤","🛳️","⚓","🚧","⛽","🚦","🚥","🛑","⚠️","❗","❓","💬","🗯️","💭","📢","📣","🔔","🔕","🔊","🔇"
];

            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                await sock.sendMessage(id, {
                    react: {
                        text: randomEmoji,
                        key: m.key
                    }
                });
            } catch (err) {
                console.log("❌ React Error:", err.message);
            }
        }
        // ==========================================
        // 6. [ نظام الردود التلقائية - ALPHA X RESPONSES ]
        // ==========================================
        
        // التحقق من تفعيل الردود من إعدادات البوت العامة
        const globalSettings = db.data.settings || {};
        
        if (globalSettings.responses === true && !m.key.fromMe && !m.isGroupUpdate && !isStub) {
            const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || m.labels?.[0] || '').toLowerCase().trim();

            // مصفوفة الردود (نص : رد)
            const replies = {
                // ضحك
                "😂": "ضحك",
                "خخخ": "خخخخخخخخ\nخوخ ومنجا وسوق العبور كلو🧏🏻‍♂️🦦\nحاسب لتشرق😂",
                "خخخخ": "خخخخخخخخ\nخوخ ومنجا وسوق العبور كلو🧏🏻‍♂️🦦\nحاسب لتشرق😂",
                
                // شتائم (تم دمجها بذكاء)
                "خول": "الله يسامحك يخول🙄\nزبي فتيزك اتحول🤤",
                "يخول": "الله يسامحك يخول🙄\nزبي فتيزك اتحول🤤",
                "متناك": "زبي اداك علي قفاك😘",
                "يمتناك": "زبي اداك علي قفاك😘",
                "كسمك": "كسمينك😍\nالله يسامحك🙂",
                "بوت خرا": "بص يسطا لم نفسك بدل ما انسي اني بوت و امسح بيك بلاط الشات😒🗿",
                "بوت زفت": "بص يسطا لم نفسك بدل ما انسي اني بوت و امسح بيك بلاط الشات😒🗿",
                "خرا عليك": "بص يسطا لم نفسك بدل ما انسي اني بوت و امسح بيك بلاط الشات😒🗿",
                
                // غباء
                "عبيط": "مفيش اغبى منك في العالم🥷",
                "يا عبيط": "مفيش اغبى منك في العالم🥷",
                "اهبل": "مفيش اغبى منك في العالم🥷",
                "غبي": "مفيش اغبى منك في العالم🥷",
                
                // ترحيب
                "السلام عليكم": "وعليكم السلام ♥🐥",
                "سلام عليكم": "وعليكم السلام ♥🐥",
                "هلا": "اهلين كيف حالك 🐤🌹",
                
                // حب
                "بحبك": "بعشقككك💋",
                "بعشقك": "بعشقككك💋",
                "بموت فيك": "بعشقككك💋",
                "بحبك بوت": "اسكت بدل ما انادي مطوري يفشخك😒",
                "بوت بحبك": "اسكت بدل ما انادي مطوري يفشخك😒",
                
                // ملل وايموجي
                "ملل": "لانك موجود🗿",
                "مللل": "لانك موجود🗿",
                "زهق": "لانك موجود🗿",
                "🤖": "انت بوت عشان ترسل الملصق ده 🐦",
                "🐦‍⬛": "🐦",
                "🐤": "🐦",
                "🦦": "🐧",
                
                // كلمات متنوعة
                "احتين": "خدها و شلحها😆",
                "احا": "خدها و شلحها😆",
                "جينو": "شبيك لبيك الصياد ألفا بين ايديك 🥷",
                "الحمدلله": "ادام الله حمدك",
                "حمدا لله": "ادام الله حمدك",
                "بوت": "ألفا × موجود",
                "بوتات": "ألفا × موجود",
                "يب": "يعم استرجل وقول نعم 🐦",
                "ييب": "يعم استرجل وقول نعم 🐦",
                "نعم": "حد ناداك 🌚🐦",
                "ايه": "بلاش ارد احسن🌝🤣",
                
                // مجاملات
                "منور": "بنوري انا 🫠💔",
                "منوره": "بنوري انا 🫠💔",
                "نورك": "يعم بنوري انا 🫠🐦",
                "بنورك": "يعم بنوري انا 🫠🐦",
                "دا نورك": "يعم بنوري انا 🫠🐦",
                
                // دخول وخروج واختبار
                "باي": "غور ما بطيقه🗿",
                "انا جيت": "امشي تاني",
                "تست": "ألفا × في الخدمة"
            };

            // البحث عن الرد المناسب
            if (replies[text]) {
                await sock.sendMessage(id, { text: replies[text] }, { quoted: m });
            }
        }

              // ==========================================
        // 7. [ نظام التذكير بالصلاة - AUTO PRAYER ]
        // ==========================================
        
        // 1. تحديد مواقيت الصلاة (توقيت إنجمينا)
        const prayerTimes = {
            "الفجر": "04:55",
            "الظهر": "12:50",
            "العصر": "15:30",
            "المغرب": "18:00",
            "العشاء": "19:30"
        };

        // 2. الحصول على الوقت الحالي في إنجمينا
        const nowInChad = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Ndjamena" }));
        const currentTime = `${nowInChad.getHours().toString().padStart(2, "0")}:${nowInChad.getMinutes().toString().padStart(2, "0")}`;

        // 3. استخدام ذاكرة مؤقتة (Global) لمنع تكرار الإرسال في نفس الدقيقة
        if (!global.prayerCache) global.prayerCache = {};

        for (const [name, time] of Object.entries(prayerTimes)) {
            // التحقق إذا حان الوقت ولم يتم الإرسال لهذه المجموعة في هذه الدقيقة
            if (currentTime === time && global.prayerCache[id] !== time) {
                
                let prayerCaption = `*⎔⋅• ━╼╃ ⌬〔️🕋〕⌬ ╄╾ ━ •⋅⎔*
*✧ \`تذكير بموعد الصلاة\` ✧*
*⎔⋅• ━╼╃ ⌬〔️🕋〕⌬ ╄╾ ━ •⋅⎔*

*🕋 حان الآن موعد صلاة : ⟦ ${name} ⟧*

*✠ ━━ • ━ ‹✤› ━ • ━━ ✠*
*⏰ التوقيت الحالي : ⟦ ${time} ⟧*
*🌍 المدينة : ⟦ إنجمينا ⟧*
*✠ ━━ • ━ ‹✤› ━ • ━━ ✠*

> *﴿إِنَّ الصَّلاةَ كانَت عَلَى المُؤمِنينَ كِتابًا مَوقوتًا﴾*
> اذهب وتوضأ الآن وقم لصلاتك.. ولا تنسانا من صالح دعائك.

*⎔⋅• ━╼╃ ⌬〔️🕋〕⌬ ╄╾ ━ •⋅⎔*
> *𝙱𝚈┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃*`;

                await sock.sendMessage(id, { text: prayerCaption });

                // حفظ الوقت في الكاش لمنع التكرار
                global.prayerCache[id] = time;

                // مسح الكاش بعد دقيقة واحدة للسماح بالصلوات القادمة
                setTimeout(() => {
                    delete global.prayerCache[id];
                }, 61000);
            }
        }
                                              // ==========================================
        // 8. [ نظام الكتم التلقائي - ALPHA X MUTE ]
        // ==========================================

        // استخدمنا المتغيرات المعرفة في أعلى الملف (id, senderJid, user)
        if (user && user.muto === true && !m.key.fromMe && !isStub && !isGroupUpdate) {
            
            // سطر تجريبي لمراقبة العمل من التيرمنال
            

            try {
                // الحذف باستخدام الطريقة المختصرة والأكثر استقراراً
                await sock.sendMessage(id, {
                    delete: {
                        remoteJid: id,
                        fromMe: false,
                        id: m.key.id,
                        participant: senderJid
                    }
                });
                
                // إرجاع true لإيقاف المعالج في main.js ومنع الردود أو الـ XP
                return true; 
            } catch (err) {
                console.log(chalk.red("❌ فشل حذف رسالة المكتوم:"), err.message);
            }
        }





    } catch (e) {
        console.log(chalk.red("❌ Error in automatic.js:"), e.message);
    }
}
