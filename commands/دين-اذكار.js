export default {
    name: 'اذكار',
    aliases: ['الأذكار', 'الذكر', 'ذكار'],
    category: 'ق5',
    description: 'عرض أذكار الصباح والمساء وأذكار الصلاة',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        const type = args[0];

        const subCategories = {
            '1': { title: 'أذكار الصباح', file: 'https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6ee862e641bc6940fe23f1bdcd3ef/azkar.json' },
            '2': { title: 'أذكار المساء', file: '' },
            '3': { title: 'أذكار بعد الصلاة', file: '' }
        };

        if (!type || !['1', '2', '3'].includes(type)) {
            let menu = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                       `> *✧────[ \`حصن المسلم\` ]────╮*\n` +
                       `> *الرجاء اختيار رقم القسم:*\n\n` +
                       `*1.* أذكار الصباح ☀️\n` +
                       `*2.* أذكار المساء 🌙\n` +
                       `*3.* أذكار بعد الصلاة 📿\n\n` +
                       `> *💡 مثال:* \`${ctx.cfg.prefix}اذكار 1\`\n` +
                       `> *┤────────────···*\n` +
                       `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;
            return sock.sendMessage(chatJid, { text: menu }, { quoted: m });
        }

        // ملاحظة: هنا يمكنك جلب الأذكار من API أو وضعها يدوياً. 
        // سأضع لك مثالاً لأذكار الصباح والمساء لتجربة الأمر:
        
        let zikrContent = "";
        if (type === '1') {
            zikrContent = "*(أذكار الصباح)*\n\n- آية الكرسي.\n- سورة الإخلاص والمعوذتين (3 مرات).\n- أصبحنا وأصبح الملك لله والحمد لله..";
        } else if (type === '2') {
            zikrContent = "*(أذكار المساء)*\n\n- آية الكرسي.\n- سورة الإخلاص والمعوذتين (3 مرات).\n- أمسينا وأمسى الملك لله والحمد لله..";
        } else {
            zikrContent = "*(أذكار بعد الصلاة)*\n\n- أستغفر الله (3 مرات).\n- اللهم أنت السلام ومنك السلام..\n- التسبيح والتحميد والتكبير (33 مرة).";
        }

        const finalMsg = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                         `> *✧────[ ${subCategories[type].title} ]────╮*\n\n` +
                         `${zikrContent}\n\n` +
                         `> *┤────────────···*\n` +
                         `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

        await sock.sendMessage(chatJid, { text: finalMsg }, { quoted: m });
    }
};
