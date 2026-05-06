import pkg from '@whiskeysockets/baileys';

export default async function (sock, m, ctx) {
    const channels = [
        { id: "120363416870755391@newsletter", name: '𝐊𝐎𝐑𝐍𝐎𝐒 ꒰🐉⃝⃕꒱𝐔𝐏𝐃𝐀𝐓𝐄' },
        { id: "120363416870755391@newsletter", name: '𝐀𝐋𝐏𝐇𝐀 ꒰🐲⃝⃕꒱ 𝐗' }
    ];

    const randomChannel = channels[Math.floor(Math.random() * channels.length)];

    if (!sock.isChannelInjected) {
        const originalSendMessage = sock.sendMessage.bind(sock);

        sock.sendMessage = async (jid, content, options = {}) => {
            if (content && typeof content === 'object' && !content.react) {
                
                // 1. التأكد من وجود كائن contextInfo
                content.contextInfo = content.contextInfo || {};

                // 2. حقن بيانات القناة
                content.contextInfo.isForwarded = true;
                content.contextInfo.forwardedNewsletterMessageInfo = {
                    newsletterJid: randomChannel.id,
                    serverMessageId: '',
                    newsletterName: randomChannel.name
                };

                // 3. الحل الجذري للمنشن:
                // إذا كان هناك منشنات في الأوبشنز، نضعها داخل الـ contextInfo ونضمن بقاءها في الأوبشنز أيضاً
                if (options.mentions && Array.isArray(options.mentions)) {
                    content.contextInfo.mentionedJid = options.mentions;
                } else if (content.mentions && Array.isArray(content.mentions)) {
                    // في حال كانت المنشنات داخل المحتوى نفسه
                    content.contextInfo.mentionedJid = content.mentions;
                }
            }
            return originalSendMessage(jid, content, options);
        };

        sock.isChannelInjected = true;
    }
}
