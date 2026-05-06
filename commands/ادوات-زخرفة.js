// دالة مساعدة لربط الحروف بالستايل
const mapStyle = (...chars) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    return Object.fromEntries(alphabet.map((char, i) => [char, chars[i]]));
};

const styles = [
    { name: "Andy Script", map: mapStyle('𝒶','𝒷','𝒸','𝒹','𝑒','𝒻','𝒼','𝒽','𝒾','𝒿','𝓀','𝓁','𝓂','𝓃','𝑜','𝓅','𝓆','𝓇','𝓈','𝓉','𝓊','𝓋','𝓌','𝓍','𝓎','𝓏') },
    { name: "Italic", map: mapStyle('𝘢','𝘣','ｃ','𝘥','ｅ','ｆ','ｇ','ｈ','ｉ','ｊ','ｋ','ｌ','ｍ','ｎ','ｏ','ｐ','𝘲','ｒ','ｓ','ｔ','ｕ','ｖ','ｗ','ｘ','ｙ','ز') },
    { name: "Double", map: mapStyle('𝕒','𝕓','𝕔','𝕕','𝕖','𝕗','𝕘','𝕙','𝕚','𝕛','𝕜','𝕝','𝕞','𝕟','𝕠','𝕡','𝕢','𝕣','𝕤','𝕥','𝕦','𝕧','𝕨','𝕩','𝕪','𝕫') },
    { name: "Blackletter", map: mapStyle('𝖆','𝖇','𝖈','𝖉','𝖊','𝖋','𝖌','𝖍','𝖎','𝖏','𝖐','𝖑','𝖒','𝖓','𝖔','𝖕','𝖖','𝖗','𝖘','𝖙','𝖚','𝖛','𝖜','𝖝','𝖞','𝖟') },
    { name: "Monospace", map: mapStyle('𝙖','𝙗','𝙘','𝙙','𝙚','𝙛','𝙜','𝙝','𝙞','𝙟','𝙠','𝙡','𝙢','𝙣','𝙤','𝙥','𝙦','𝙧','𝙨','𝙩','𝙪','𝙫','𝙬','𝙭','𝙮','𝙯') },
    { name: "Bold", map: mapStyle('𝐚','𝐛','𝐜','𝐝','𝐞','𝐟','𝐠','𝐡','𝐢','𝐣','𝐤','𝐥','𝐦','𝐧','𝐨','𝐩','𝐪','𝐫','𝐬','𝐭','𝐮','𝐯','𝐰','𝐱','𝐲','𝐳') },
    { name: "Bold Italic", map: mapStyle('𝑨','𝑩','𝑪','𝑫','𝑬','𝑭','𝑮','𝑯','𝑰','𝑱','𝑲','𝑳','𝑴','𝑵','𝑶','𝑷','𝑸','𝑹','𝑺','𝑻','𝑼','𝑽','𝑾','𝑿','𝒀','𝒁') },
    { name: "Perift", map: mapStyle('𝓪','𝓫','𝓬','𝓭','𝓮','𝓯','𝓰','𝓱','𝓲','𝓳','𝓴','𝓵','𝓶','𝓷','𝓸','𝓹','𝓺','𝓻','𝓼','𝓽','𝓾','𝓿','𝔀','𝔁','𝔂','𝔃') },
    { name: "Boxed", map: mapStyle('🅐','🅑','🅒','🅓','🅔','🅕','🅖','🅗','🅘','🅙','🅚','🅛','🅜','🅝','🅞','🅟','🅠','🅡','🅢','🅣','🅤','🅥','🅦','🅧','🅨','🅩') }
];

export default {
    name: 'خط',
    aliases: ['زخرفة', 'زخرف'],
    category: 'ق2',
    description: 'زخرفة النصوص الإنجليزية عن طريق اختيار رقم الستايل',
    execute: async (sock, m, args, ctx) => {
        const chatJid = m.key.remoteJid;
        
        // جلب النص سواء من الأوامر أو الرد
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let content = (quoted?.conversation || quoted?.extendedTextMessage?.text || '').trim();
        
        // التحقق مما إذا كان المستخدم أدخل رقماً للاختيار (مثال: .خط 3)
        const choice = parseInt(args[0]);

        if (choice && choice > 0 && choice <= styles.length) {
            // إذا كان المستخدم قد اختار رقماً بالفعل، نقوم بتطبيق الزخرفة على النص المقتبس
            if (!content) return sock.sendMessage(chatJid, { text: '⚠️ | يرجى الرد على النص الذي تريد زخرفته بهذا الرقم.' }, { quoted: m });
            
            const selectedStyle = styles[choice - 1];
            const stylizedText = content.replace(/[a-z]/gi, char => {
                let lower = char.toLowerCase();
                return selectedStyle.map[lower] || char;
            });

            return sock.sendMessage(chatJid, { text: stylizedText }, { quoted: m });
        }

        // إذا لم يختر رقماً، نعرض له القائمة بكامل الستايلات مطبقة على النص الذي أدخله
        let textToStyle = args.join(' ') || content;

        if (!textToStyle) {
            return sock.sendMessage(chatJid, { 
                text: `⚠️ | يرجى كتابة نص أو الرد على رسالة لزخرفتها.\nمثال: ${ctx.cfg.prefix}خط Alpha Bot` 
            }, { quoted: m });
        }

        let menuText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                       `> *✧────[ \`قائمة الزخارف\` ]────╮*\n` +
                       `> *📝 النص:* ${textToStyle}\n\n`;

        styles.forEach((style, index) => {
            const stylizedSample = textToStyle.replace(/[a-z]/gi, char => {
                let lower = char.toLowerCase();
                return style.map[lower] || char;
            });
            menuText += `*${index + 1}.* ${stylizedSample}\n`;
        });

        menuText += `\n> *💡 نصيحة:* يمكنك كتابة \`${ctx.cfg.prefix}خط [الرقم]\` بالرد على رسالة لزخرفتها مباشرة.\n` +
                    `> *┤────────────···*\n` +
                    `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

        await sock.sendMessage(chatJid, { text: menuText }, { quoted: m });
    }
};
