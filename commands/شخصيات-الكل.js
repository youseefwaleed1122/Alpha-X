import axios from 'axios';
import chalk from 'chalk';

export default {
    name: 'شخصية',
    aliases: ['سونغ', 'ارثر', 'ساسكي', 'هينتا', 'اوبيتو', 'ايتاشي', 'ايرين', 'غوكو'],
    description: 'تحدث مع شخصيات الأنمي والأسطورة',
    execute: async (sock, m, args, ctx) => {
        const text = args.join(' ');
        
        const cmdText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const characterName = cmdText.split(' ')[0].slice(1); 

        if (!text) return sock.sendMessage(m.key.remoteJid, { text: `⚠️ | ماذا تريد أن تقول لـ ${characterName}؟` }, { quoted: m });

        const prompts = {
            'سونغ': 'أنت الآن سونغ جينوو، ملك الظلال. تحدث ببرود وثقة، استخدم كلمات مثل "انهض".',
            'ارثر': 'أنت الملك آرثر، تحدث بنبل وشجاعة فرسان الطاولة المستديرة.',
            'ساسكي': 'أنت ساسكي أوتشيها، تحدث ببرود وهدفك الانتقام، كلامك حاد وقصير.',
            'هينتا': 'أنت هيناتا هيوغا، تحدث بخجل ولطف شديدين واستخدم "..." كثيراً.',
            'اوبيتو': 'أنت أوبيتو أوتشيها، أسلوبك فلسفي ومظلم عن عالم الأحلام.',
            'ايتاشي': 'أنت إيتاشي أوتشيها، تحدث بهدوء وحكمة الأخ الأكبر.',
            'ايرين': 'أنت إيرين ييغر، تحدث عن الحرية وإبادة الأعداء.',
            'غوكو': 'أنت سون غوكو، تحدث بحماس عن القتال والطعام.'
        };

        const systemPrompt = prompts[characterName] || 'أنت مساعد ذكي.';

        try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${ctx.cfg.geminiKey}`;
            
            const geminiResponse = await axios.post(geminiUrl, {
                contents: [{
                    parts: [{ text: `Roleplay Instruction: ${systemPrompt}\n\nUser Question: ${text}` }]
                }]
            });

            const result = geminiResponse.data.candidates[0].content.parts[0].text;
            
            const aiText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n` +
                           `> *✧────[ \`${characterName.toUpperCase()}\` ]────╮*\n` +
                           `> ${result}\n` +
                           `> *┤────────────···*\n` +
                           `> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`;

            await sock.sendMessage(m.key.remoteJid, { text: aiText }, { quoted: m });

        } catch (err) {
            console.log(chalk.yellow("⚠️ Gemini Failed, trying OpenAI..."));
            
            try {
                const res = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ]
                }, {
                    headers: { 
                        'Authorization': `Bearer ${ctx.cfg.openAIKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = res.data.choices[0].message.content;
                await sock.sendMessage(m.key.remoteJid, { text: `*(OpenAI)*\n${result}` }, { quoted: m });

            } catch (openAiErr) {
                console.log(chalk.red("❌ Both APIs Failed:"), openAiErr.message);
                sock.sendMessage(m.key.remoteJid, { text: '❌ | عذراً، جميع المحركات معطلة حالياً. تأكد من صحة مفاتيح الـ API في config.js' }, { quoted: m });
            }
        }
    }
};
