export default {
    name: 'لينك',
    aliases: ['رابط', 'الرابط', 'link'],
    category: 'ق6',
    description: 'يرسل رابط دعوة المجموعة',
    execute: async (sock, m, args, ctx) => {
        try {
            const chatJid = m.key.remoteJid;
            if (!chatJid.endsWith('@g.us')) return;

            // محاولة جلب الرابط مباشرة
            try {
                // كود توليد الرابط من واتساب
                const code = await sock.groupInviteCode(chatJid);
                const groupLink = `https://chat.whatsapp.com/${code}`;

                const linkText = `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━

> *✧────[ \`رابط الدعوة\` ]────╮*
> *┤ 🔗┊ الرابط:*
> *┤ ${groupLink}*
> *┤────────────···*
> *✧────[ \`تنبيه\` ]────╮*
> *┤ ⚠️┊ لا تشارك الرابط مع الغرباء*
> *┤ 🛡️┊ اتبع قوانين المجموعة دائماً*
> *┤────────────···*
> *⋅ ───━ •﹝♦﹞• ━─── ⋅*
> 𝙱𝙰┇𝙰𝙻𝙿𝐇𝙰 𝚇 𝙱𝙾𝚃`;

                await sock.sendMessage(chatJid, { 
                    text: linkText,
                    contextInfo: {
                        externalAdReply: {
                            title: "𝐀𝐋𝐏𝐇𝐀 𝐗 - 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊",
                            body: "رابط الانضمام للمجموعة",
                            thumbnailUrl: "https://telegra.ph/file/0c329f64e167389140e4f.jpg", // يمكنك تغيير الرابط لصورة البوت الخاصة بك
                            sourceUrl: groupLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });

            } catch (err) {
                // في حال فشل البوت (غالباً لأنه ليس مشرفاً)
                return sock.sendMessage(chatJid, { 
                    text: '❌ | عذراً، يجب أن أكون مشرفاً لأتمكن من استخراج رابط المجموعة.' 
                }, { quoted: m });
            }

        } catch (error) {
            console.error("Error in Link Command:", error);
        }
    }
};
