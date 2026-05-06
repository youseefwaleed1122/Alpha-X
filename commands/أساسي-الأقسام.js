export default {
    name: 'ق',
    aliases: ['ق1', 'ق2', 'ق3', 'ق4', 'ق5', 'ق6', 'ق7','ق8', 'ق9', 'ق10', 'ق11', 'ق12', 'ق13', 'ق14', 'ق15'],
    execute: async (sock, m, args, ctx) => {
        const { cmds } = ctx;
        const chatJid = m.key.remoteJid;

        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const cmdUsed = text.trim().split(' ')[0].slice(1);
        const categoryNumber = cmdUsed.replace('ق', '');

        const categoryNames = {
            'ق1': 'الشخصيات',
            'ق2': 'الأدوات',
            'ق3': 'المطور',
            'ق4': 'المشرفين',
            'ق5': 'الدين',
            'ق6': 'الجروبات',
            'ق7': 'الألعاب',
            'ق8': 'الصور',
            'ق9': 'البنك',
            'ق10': 'الميديا',
            'ق11': 'الحماية'
        };

        const categoryEmoji = {
            'ق1': '🎭',
            'ق2': '🧰',
            'ق3': '🧑‍💻',
            'ق4': '👑',
            'ق5': '☪️',
            'ق6': '👥',
            'ق7': '🎮',
            'ق8': '🖼️',
            'ق9': '🏦',
            'ق10': '⬇️',
            'ق11': '🛡️'
        };

        // =========================
        // 📌 أوامر يدوية إضافية
        // =========================
        const manualCommands = {
    'ق1': [
        { name: 'سونغ', description: 'التحدث مع ملك الظلال سونغ جينوو' },
        { name: 'ارثر', description: 'استشارة الملك آرثر ملك بريطانيا' },
        { name: 'ساسكي', description: 'الدردشة مع ساسكي أوتشيها البارد' },
        { name: 'هينتا', description: 'التحدث مع هيناتا هيوغا اللطيفة' },
        { name: 'اوبيتو', description: 'فلسفة العالم مع أوبيتو أوتشيها' },
        { name: 'ايتاشي', description: 'حكمة الأخ الأكبر إيتاشي أوتشيها' },
        { name: 'ايرين', description: 'مناقشة الحرية مع إيرين ييغر' },
        { name: 'غوكو', description: 'الحماس والقتال مع سون غوكو' },
    ],
    'ق6': [
        { name: 'الترقية', description: 'تفعيل أو تعطيل نظام الترقية التلقائية' },
        { name: 'الترحيب', description: 'تفعيل أو تعطيل رسالة الترحيب' },
        { name: 'التغيرات', description: 'تفعيل أو تعطيل اشعارات التغييرات' },
        { name: 'الايموجي', description: 'تفعيل أو تعطيل تفاعل الايموجي' },
        { name: 'القبول', description: 'تفعيل أو تعطيل القبول التلقائي' },
    ],
    'ق11': [
        { name: 'الوهمية', description: 'تفعيل أو تعطيل مضاد الأرقام الوهمية' },
        { name: 'الروابط', description: 'تفعيل أو تعطيل مضاد الروابط' },
        { name: 'الشتائم', description: 'تفعيل أو تعطيل مضاد السب' },
        { name: 'الاسبام', description: 'تفعيل أو تعطيل مضاد الاسبام' },
    ],
};


        // =========================
        // 📌 عرض كل الأقسام (.ق بدون رقم)
        // =========================
        if (!categoryNumber) {
            const menuText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
\`قائمة كل الأقسام المتوفرة في البوت\`
> *✧────[ الأقسام ]────╮*
> *┤────────────···*
> *┤🎭┊ \`.ق1\`:قسم الشخصيات*
> *┤🧰┊ \`.ق2\`: قسم الأدوات*
> *┤🧑‍💻┊ \`.ق3\`: قسم المطور*
> *┤🧾┊ \`.ق4\`: قسم المشرفين*
> *┤☪️┊ \`.ق5\`: قسم الدين*
> *┤👥┊ \`.ق6\`: قسم الجروبات*
> *┤🎮┊ \`.ق7\`: قسم الألعاب*
> *┤🖼️┊ \`.ق8\`: قسم الصور*
> *┤🎴┊ \`.ق9\`: قسم الملصقات*
> *┤🏦┊ \`.ق10\`: قسم البنك*
> *┤⬇️┊ \`.ق11\`: قسم الميديا*
> *┤🛡️┊ \`.ق12\`: قسم الحماية*
> *┤🧠┊ \`.ق13\`: قسم الذكاء AI*
> *┤🕹️┊ \`.ق14\`: قسم الفعاليات*
> *┤♨️┊ \`.ق15\`: قسم النظام*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            return await sock.sendMessage(chatJid, { text: menuText }, { quoted: m });
        }

        // =========================
        // 📌 قسم معين
        // =========================
        const targetCategory = `ق${categoryNumber}`;
        const emoji = categoryEmoji[targetCategory] || '♦';
        const categoryLabel = categoryNames[targetCategory];

        // ✅ أوامر من الملفات - يقبل الاسم العربي أو رقم القسم
        const fileCmds = [...cmds.values()]
            .filter(v => v.category === categoryLabel || v.category === targetCategory);

        // أوامر يدوية
        const extraCmds = manualCommands[targetCategory] || [];

        // دمج الكل
        const allCmds = [...fileCmds, ...extraCmds];

        if (!allCmds.length) {
            return await sock.sendMessage(chatJid, {
                text: `> ⚠️ القسم *[ ${targetCategory} ]* فارغ حالياً.`
            }, { quoted: m });
        }

        const categoryText = `> ━ ╼╃ ⌬〔 *قسم: ${categoryLabel || targetCategory}* 〕⌬ ╄╾ ━
> *┤────────────···*
${allCmds.map(v => {
    return `> *┤ ${emoji}┊ .${v.name}*\n> *┤ \`${v.description || 'لا يوجد وصف'}\`*`;
}).join('\n')}
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝚈┇ 𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

        return await sock.sendMessage(chatJid, { text: categoryText }, { quoted: m });
    }
};