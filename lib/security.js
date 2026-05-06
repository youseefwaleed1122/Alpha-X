import chalk from 'chalk';

export default async function (sock, m, ctx) {
    const { db } = ctx;

    try {
        if (!m || !m.key || !m.key.remoteJid) return;
        const chatJid = m.key.remoteJid;
        if (m.key.fromMe) return;

        // ==========================================
        // 5. [ نظام مضاد الخاص التلقائي ]
        // ==========================================
        if (!chatJid.endsWith('@g.us')) {
            try {
                const settings = db.data.settings || {};
                if (!settings.private) return;

                const senderJid = m.key.remoteJid;
                const isOwner = ctx.cfg.ownerNumber === senderJid || ctx.cfg.eliteNumbers.includes(senderJid);
                if (isOwner) return;

                await sock.sendMessage(senderJid, {
                    text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *✧────[ \`تنبيه\` ]────╮*\n> *┤ ⚠️┊ عذراً التحدث في الخاص ممنوع*\n> *┤ 🚫┊ تم تفعيل الحماية من الإسبام*\n> *┤ 💬┊ تواصل معنا عبر المجموعة فقط*\n> *┤────────────···*\n> *⋅ ───━ •﹝♦﹞• ━─── ⋅*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
                });

                console.log(chalk.blue(`[PRIVATE] Blocked private message from: ${senderJid}`));
                return true;
            } catch (err) {
                console.log(chalk.red('❌ Private Error:'), err.message);
            }
            return;
        }

        // ==========================================
        // فلتر الجروب
        // ==========================================
        const groupConfig = db.data.chats[chatJid] || {};

        const text = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption || ""
        ).toLowerCase();

        // ==========================================
        // 1. [ نظام مضاد الروابط التلقائي ]
        // ==========================================
        if (groupConfig.antilink) {
            const hasLink = text.includes('chat.whatsapp.com') || text.includes('whatsapp.com/channel');

            if (hasLink) {
                const groupMetadata = await sock.groupMetadata(chatJid).catch(() => ({ participants: [] }));
                const participants = groupMetadata.participants || [];
                const senderJid = m.key.participant || m.participant || chatJid;

                const userInGroup = participants.find(p => p.id === senderJid);
                const isSenderAdmin = userInGroup?.admin === 'admin' || userInGroup?.admin === 'superadmin';

                try {
                    await sock.sendMessage(chatJid, { delete: m.key });
                } catch (err) {
                    return;
                }

                if (isSenderAdmin) {
                    console.log(chalk.blue(`[SECURITY] أدمن أرسل رابطاً: ${m.pushName}`));
                    await sock.sendMessage(chatJid, {
                        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n*عذراً يا مشرف @${senderJid.split('@')[0]}*\n*قوانين المجموعة تمنع الروابط، تم التنظيف.*`,
                        mentions: [senderJid]
                    });
                    return true;
                }

                if (!db.data.users[senderJid]) db.data.users[senderJid] = {};
                const user = db.data.users[senderJid];
                if (!user.warnlink) user.warnlink = {};
                user.warnlink[chatJid] = (user.warnlink[chatJid] || 0) + 1;

                if (user.warnlink[chatJid] >= 2) {
                    await sock.sendMessage(chatJid, {
                        text: `*🚨 تم طرد @${senderJid.split('@')[0]} بسبب تكرار إرسال الروابط!*`,
                        mentions: [senderJid]
                    });
                    await sock.groupParticipantsUpdate(chatJid, [senderJid], 'remove');
                    user.warnlink[chatJid] = 0;
                } else {
                    await sock.sendMessage(chatJid, {
                        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n> *✧───[ \`المعلومات\`  ]───╮*\n> *┤ لقد أرسلت رابط في المجموعة*\n> *┤ وهذا يخالف القوانين تم حذف رابطك*\n> *┤ إذا أعدت الكرة سيتم طردك من الجروب*\n> *┤────────────···*\n> *⋅ ───━ •﹝♦﹞• ━─── ⋅*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`
                    }, { quoted: m });
                }

                db.save();
                return true;
            }
        }

        // ==========================================
        // 2. [ نظام مضاد الأرقام الوهمية التلقائي ]
        // ==========================================
        if (groupConfig.antifake) {
            try {
                const blockedCountries = ['91','92','86','82','84','39','880','62','63'];
                const groupMetadata = await sock.groupMetadata(chatJid).catch(() => ({ participants: [] }));
                const participants = groupMetadata.participants || [];

                for (let user of participants) {
                    const jid = user.id;
                    const number = jid.split('@')[0];

                    if (user.admin === 'admin' || user.admin === 'superadmin') continue;

                    const isBlocked = blockedCountries.some(code => number.startsWith(code));

                    if (isBlocked) {
                        await sock.groupParticipantsUpdate(chatJid, [jid], 'remove');
                        if (db.data.users[jid]) delete db.data.users[jid];
                        await sock.sendMessage(chatJid, {
                            text: `🚫 تم طرد رقم وهمي: @${number}`,
                            mentions: [jid]
                        });
                        console.log(chalk.yellow(`[ANTIFAKE] Removed: ${number}`));
                    }
                }
                db.save();
            } catch (err) {
                console.log(chalk.red('❌ AntiFake Error:'), err.message);
            }
        }

        // ==========================================
        // 3. [ نظام مضاد الإسبام التلقائي ]
        // ==========================================
        if (groupConfig.antispam) {
            try {
                const senderJid = m.key.participant || m.participant || chatJid;
                const userInGroup = (await sock.groupMetadata(chatJid).catch(() => ({ participants: [] }))).participants.find(p => p.id === senderJid);
                const isSenderAdmin = userInGroup?.admin === 'admin' || userInGroup?.admin === 'superadmin';

                if (!isSenderAdmin) {
                    if (!db.data.users[senderJid]) db.data.users[senderJid] = {};
                    const user = db.data.users[senderJid];

                    if (!user.spamData) user.spamData = {};
                    if (!user.spamData[chatJid]) user.spamData[chatJid] = { count: 0, lastTime: 0 };

                    const now = Date.now();
                    const timeDiff = now - user.spamData[chatJid].lastTime;

                    if (timeDiff < 5000) {
                        user.spamData[chatJid].count += 1;
                    } else {
                        user.spamData[chatJid].count = 1;
                    }

                    user.spamData[chatJid].lastTime = now;

                    if (user.spamData[chatJid].count === 5) {
                        await sock.sendMessage(chatJid, {
                            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *⚠️ تحذير @${senderJid.split('@')[0]}*\n> *┤ لا ترسل رسائل بشكل متكرر*\n> *┤ إذا استمريت سيتم طردك*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                            mentions: [senderJid]
                        }, { quoted: m });
                    }

                    if (user.spamData[chatJid].count >= 10) {
                        await sock.sendMessage(chatJid, {
                            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *🚨 تم طرد @${senderJid.split('@')[0]}*\n> *┤ السبب: إرسال إسبام متكرر*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                            mentions: [senderJid]
                        });
                        await sock.groupParticipantsUpdate(chatJid, [senderJid], 'remove');
                        user.spamData[chatJid] = { count: 0, lastTime: 0 };
                        console.log(chalk.yellow(`[ANTISPAM] Removed spammer: ${senderJid}`));
                    }

                    db.save();
                }
            } catch (err) {
                console.log(chalk.red('❌ AntiSpam Error:'), err.message);
            }
        }

        // ==========================================
        // 4. [ نظام مضاد الشتائم التلقائي ]
        // ==========================================
        if (groupConfig.antiswear) {
            try {
                const senderJid = m.key.participant || m.participant || chatJid;
                const userInGroup = (await sock.groupMetadata(chatJid).catch(() => ({ participants: [] }))).participants.find(p => p.id === senderJid);
                const isSenderAdmin = userInGroup?.admin === 'admin' || userInGroup?.admin === 'superadmin';

                const toxicRegex = /(كسمك|كسم|كس امك|طيز|طيزك|زب|زبي|نيك|ينك|متناك|منيوك|خول|ياخول|شرموطه|شرموطة|لبوه|لبوة|عرص|عرصه|بضان|كسختك|قحبه|قحبة|كلب|حمار|ياحمار|غبي|ياكلب|تفو|تفوه|لعنه|ملعون|زق|خرا|خرا عليك|تبا لك|كس اختك)/i;
                const hasToxic = toxicRegex.test(text);

                if (hasToxic && !isSenderAdmin) {
                    try {
                        await sock.sendMessage(chatJid, { delete: m.key });
                    } catch { return; }

                    if (!db.data.users[senderJid]) db.data.users[senderJid] = {};
                    const user = db.data.users[senderJid];
                    if (!user.warnswear) user.warnswear = {};
                    user.warnswear[chatJid] = (user.warnswear[chatJid] || 0) + 1;

                    if (user.warnswear[chatJid] < 3) {
                        await sock.sendMessage(chatJid, {
                            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *⚠️ تحذير @${senderJid.split('@')[0]}*\n> *┤ تم حذف رسالتك بسبب استخدام ألفاظ مسيئة*\n> *┤ التحذير: ${user.warnswear[chatJid]}/3*\n> *┤ عند التحذير الثالث سيتم طردك*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                            mentions: [senderJid]
                        });
                    } else {
                        await sock.sendMessage(chatJid, {
                            text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *🚨 تم طرد @${senderJid.split('@')[0]}*\n> *┤ السبب: تكرار استخدام ألفاظ مسيئة*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                            mentions: [senderJid]
                        });
                        await sock.groupParticipantsUpdate(chatJid, [senderJid], 'remove');
                        user.warnswear[chatJid] = 0;
                        console.log(chalk.yellow(`[ANTISWEAR] Removed: ${senderJid}`));
                    }

                    db.save();
                    return true;

                } else if (hasToxic && isSenderAdmin) {
                    await sock.sendMessage(chatJid, { delete: m.key });
                    await sock.sendMessage(chatJid, {
                        text: `> ━ ╼╃ ⌬〔 ~𝐀𝐋𝐏𝐇𝐀 𝐗 𝐁𝐎𝐓~ 〕⌬ ╄╾ ━\n\n> *⚠️ مشرف @${senderJid.split('@')[0]}*\n> *┤ تم حذف رسالتك بسبب ألفاظ مسيئة*\n> *┤────────────···*\n> 𝙱𝙰┇𝙰𝙻𝙿𝙷𝙰 𝚇 𝙱𝙾𝚃`,
                        mentions: [senderJid]
                    });
                    return true;
                }

            } catch (err) {
                console.log(chalk.red('❌ AntiSwear Error:'), err.message);
            }
        }

    } catch (e) {
        console.log(chalk.red(`❌ Security Error:`), e.message);
    }
}