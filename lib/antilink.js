const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;

/**
 * Checks if a string contains a URL.
 */
function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

/**
 * Handles Antilink for both group and private chats.
 */
async function Antilink(msg, sock) {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = isJidGroup(jid);
        const sender = msg.key.participant || jid;
        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (!messageText || typeof messageText !== 'string') return;

        // Skip owners, admins, and sudo users
        const senderIsSudo = await isSudo(sender);
        if (senderIsSudo) return;

        let isSenderAdmin = false;
        if (isGroup) {
            try {
                const adminCheck = await isAdmin(sock, jid, sender);
                isSenderAdmin = adminCheck?.isSenderAdmin || false;
                if (isSenderAdmin) return;
            } catch (_) {}
        } else {
            // Private chat, skip owner
            const ownerJid = config.OWNER_JID || '254113334497@s.whatsapp.net';
            if (sender === ownerJid) return;
        }

        // Check if message contains a URL
        if (!containsURL(messageText.trim())) return;

        // Fetch antilink configuration
        const antilinkConfig = await getAntilink(jid, 'on');
        if (!antilinkConfig?.enabled) return;

        const action = antilinkConfig.action || 'delete';

        // Delete the message first
        await sock.sendMessage(jid, { delete: msg.key });

        // Execute configured action
        switch (action) {
            case 'delete':
                await sock.sendMessage(jid, {
                    text: `⚠️ @${sender.split('@')[0]} links are not allowed here!`,
                    mentions: [sender]
                });
                break;

            case 'kick':
                if (isGroup) {
                    try {
                        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                        await sock.sendMessage(jid, {
                            text: `👢 @${sender.split('@')[0]} has been removed for sending links.`,
                            mentions: [sender]
                        });
                    } catch (e) {
                        console.error('Failed to kick user:', e);
                        await sock.sendMessage(jid, {
                            text: `⚠️ @${sender.split('@')[0]}, links are not allowed! (Failed to kick)`,
                            mentions: [sender]
                        });
                    }
                } else {
                    // Private chat: block user
                    try {
                        await sock.updateBlockStatus(sender, 'block');
                        await sock.sendMessage(jid, {
                            text: `🚫 User blocked for sending links in private chat.`,
                        });
                    } catch (e) {
                        console.error('Failed to block user:', e);
                    }
                }
                break;

            case 'warn':
                if (isGroup) {
                    const warningCount = await incrementWarningCount(jid, sender);
                    if (warningCount >= WARN_COUNT) {
                        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                        await resetWarningCount(jid, sender);
                        await sock.sendMessage(jid, {
                            text: `👢 @${sender.split('@')[0]} has been kicked after ${WARN_COUNT} warnings.`,
                            mentions: [sender]
                        });
                    } else {
                        await sock.sendMessage(jid, {
                            text: `⚠️ @${sender.split('@')[0]} warning ${warningCount}/${WARN_COUNT} for sending links.`,
                            mentions: [sender]
                        });
                    }
                } else {
                    // Private chat warning: block after WARN_COUNT
                    const warningCount = await incrementWarningCount(jid, sender);
                    if (warningCount >= WARN_COUNT) {
                        try {
                            await sock.updateBlockStatus(sender, 'block');
                            await resetWarningCount(jid, sender);
                            await sock.sendMessage(jid, {
                                text: `🚫 User blocked after ${WARN_COUNT} warnings in private chat.`,
                            });
                        } catch (e) {
                            console.error('Failed to block user:', e);
                        }
                    } else {
                        await sock.sendMessage(jid, {
                            text: `⚠️ Warning ${warningCount}/${WARN_COUNT} for sending links.`,
                        });
                    }
                }
                break;
        }
    } catch (error) {
        console.error('❌ Error in Antilink:', error);
    }
}

module.exports = { Antilink };