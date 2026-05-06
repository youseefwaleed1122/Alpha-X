// دالة مساعدة لربط الأرقام بالستايل
const mapNumbers = (...nums) => {
    const digits = '0123456789'.split('');
    return Object.fromEntries(digits.map((digit, i) => [digit, nums[i]]));
};

const numStyles = [
    { name: "Bold Serif", map: mapNumbers('𝟎','𝟏','𝟐','𝟑','𝟒','𝟓','𝟔','𝟕','𝟖','𝟗') },
    { name: "Bold Sans", map: mapNumbers('𝟬','𝟭','𝟮','𝟯','𝟰','𝟱','𝟲','𝟳','𝟴','𝟵') },
    { name: "Double Struck", map: mapNumbers('𝟘','𝟙','𝟚','𝟛','𝟜','𝟝','𝟞','𝟟','𝟠','𝟡') },
    { name: "Circled", map: mapNumbers('⓿','①','②','③','④','⑤','⑥','⑦','⑧','⑨') },
    { name: "Fullwidth", map: mapNumbers('０','１','２','３','４','５','６','７','８','９') },
    { name: "Subscript", map: mapNumbers('₀','₁','₂','₃','₄','₅','₆','₇','₈','₉') },
    { name: "Superscript", map: mapNumbers('⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹') },
    { name: "Chinese", map: mapNumbers('〇','一','二','三','四','五','六','七','八','九') }
];

export default {
    name: 'رقم',
    aliases: ['ارقام', 'زخرفة_ارقام'],
    category: 'ق2',
    description: 'زخرفة الأرقام بأشكال مختلفة',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        
        // جلب النص سواء من الأوامر أو الرد
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let content = (quoted?.conversation || quoted?.extendedTextMessage?.text || args.join(' ')).trim();
        
        // التحقق مما إذا كان المستخدم اختار رقماً للاختيار (مثال: .رقم 3)
        const choice = parseInt(args[0]);

        if (choice && choice > 0 && choice <= numStyles.length) {
            // محاولة جلب المحتوى من الرد إذا كانargs[0] هو الرقم
            let textToProcess = (quoted?.conversation || quoted?.extendedTextMessage?.text || args.slice(1).join(' ')).trim();
            
            if (!textToProcess) return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على الأرقام التي تريد زخرفتها أو كتابتها بعد رقم الستايل.' }, { quoted: m });
            
            const selectedStyle = numStyles[choice - 1];
            const stylizedNum = textToProcess.replace(/[0-9]/g, digit => selectedStyle.map[digit] || digit);

            return sock.sendMessage(chatJid, { text: stylizedNum }, { quoted: m });
        }

        if (!content) {
            return sock.sendMessage(chatJid, { 
                text: `⚠️ | يرجى كتابة أرقام أو الرد على رسالة لزخرفتها.\nمثال: ${ctx.cfg.prefix}رقم 2026` 
            }, { quoted: m });
        }

        // عرض قائمة المعاينة
        let menuText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                       `> *✧────[ \`زخرفة الأرقام\` ]────╮*\n` +
                       `> *🔢 الأرقام:* ${content}\n\n`;

        numStyles.forEach((style, index) => {
            const stylizedSample = content.replace(/[0-9]/g, digit => style.map[digit] || digit);
            menuText += `*${index + 1}.* ${stylizedSample} \`(${style.name})\`\n`;
        });

        menuText += `\n> *💡 نصيحة:* رد على رسالة واكتب \`${ctx.cfg.prefix}رقم [الرقم]\` للتحويل الفوري.\n` +
                    `> *┤────────────···*\n` +
                    `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

        await sock.sendMessage(chatJid, { text: menuText }, { quoted: m });
    }
};
