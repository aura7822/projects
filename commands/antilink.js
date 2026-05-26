const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

const OWNER_JID = '254119750041@s.whatsapp.net'; // Bot owner JID

// Normalize JID to compare correctly
function normalizeJid(jid) {
    if (!jid) return '';
    return jid.split(':')[0];
}

/**
 * Handle antilink command for both groups and personal chats
 */
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        const normalizedSender = normalizeJid(senderId);
        const normalizedOwner = normalizeJid(OWNER_JID);
        const isGroup = chatId.endsWith('@g.us');
        const isOwner = normalizedSender === normalizedOwner;

        // Permission check
        if (isGroup && !isSenderAdmin) {
            return await sock.sendMessage(chatId, { text: '👮‍♂️ *Admin Only*\nOnly group admins can manage antilink settings.' }, { quoted: message });
        }
        if (!isGroup && !isOwner) {
            return await sock.sendMessage(chatId, { text: '👑 *Owner Only*\nOnly the bot owner can manage antilink in private chats.' }, { quoted: message });
        }

        // Extract command arguments
        const prefix = '.';
        const args = userMessage.slice(9).trim().split(/\s+/);
        const action = args[0]?.toLowerCase();

        // Show help if no action
        if (!action) {
            const usage = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃   🔗 *ANTILINK SETUP*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

📌 Chat Type: ${isGroup ? '👥 Group' : '👤 Private'}
${isGroup ? '👮‍♂️ Admins Only' : '👑 Owner Only'}

📋 Commands:
┣ ➤ ${prefix}antilink on
┣ ➤ ${prefix}antilink off
┣ ➤ ${prefix}antilink status
┗ ➤ ${prefix}antilink set <delete|kick|warn>

🔍 Protected Links:
┣ • WhatsApp Group Links
┣ • WhatsApp Channel Links
┣ • Telegram Links
┗ • All External Links
            `;
            return await sock.sendMessage(chatId, { text: usage }, { quoted: message });
        }

        // Handle specific actions
        switch (action) {
            case 'on': {
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    return await sock.sendMessage(chatId, { text: '⚠️ *Antilink is already ON*' }, { quoted: message });
                }

                const result = await setAntilink(chatId, 'on', 'delete');
                if (!result) return await sock.sendMessage(chatId, { text: '❌ Failed to enable Antilink' }, { quoted: message });

                const successMsg = isGroup
                    ? `✅ *Antilink Enabled*\nAll links will now be automatically deleted. Default action: Delete`
                    : `✅ *Private Chat Protection Enabled*\nLinks will now be automatically deleted in private chat.`;
                return await sock.sendMessage(chatId, { text: successMsg }, { quoted: message });
            }

            case 'off': {
                await removeAntilink(chatId, 'on');
                const offMsg = isGroup
                    ? `❌ *Antilink Disabled*\nLinks are now allowed in this group.`
                    : `❌ *Private Chat Protection Disabled*\nLinks are now allowed in this private chat.`;
                return await sock.sendMessage(chatId, { text: offMsg }, { quoted: message });
            }

            case 'status':
            case 'get': {
                const config = await getAntilink(chatId, 'on');
                const enabled = config?.enabled || false;
                const action_ = config?.action || 'not set';

                const statusMsg = `
📊 *ANTILINK STATUS*

Chat: ${isGroup ? '👥 Group' : '👤 Private'}
Status: ${enabled ? '✅ ON' : '❌ OFF'}
Action: ${enabled ? `*${action_.toUpperCase()}*` : '—'}

${enabled ? '🛡️ Protection Active' : '⚠️ Protection Inactive'}
                `;
                return await sock.sendMessage(chatId, { text: statusMsg }, { quoted: message });
            }

            case 'set': {
                const newAction = args[1]?.toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(newAction)) {
                    return await sock.sendMessage(chatId, { text: '❌ Invalid action. Choose: delete, kick, or warn.' }, { quoted: message });
                }

                const setResult = await setAntilink(chatId, 'on', newAction);
                if (!setResult) return await sock.sendMessage(chatId, { text: '❌ Failed to update action' }, { quoted: message });

                const actionEmoji = { delete: '🗑️', kick: '👢', warn: '⚠️' }[newAction];
                return await sock.sendMessage(chatId, {
                    text: `⚙️ *Antilink Action Updated*\n${actionEmoji} New Action: ${newAction.toUpperCase()}`
                }, { quoted: message });
            }

            default:
                return await sock.sendMessage(chatId, { text: `❓ Unknown command. Use ${prefix}antilink for help.` }, { quoted: message });
        }
    } catch (error) {
        console.error('❌ Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing antilink command.' }, { quoted: message });
    }
}

/**
 * Detect and act on links in messages
 */
async function handleLinkDetection(sock, chatId, message, userMessage, senderId, isSenderAdmin) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        const normalizedSender = normalizeJid(senderId);
        const isOwner = normalizedSender === normalizeJid(OWNER_JID);

        const config = await getAntilink(chatId, 'on');
        if (!config?.enabled) return;

        // Skip owner in private chat
        if (!isGroup && isOwner) return;

        // Link patterns
        const linkPatterns = [
            { pattern: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i, type: 'WhatsApp Group' },
            { pattern: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i, type: 'WhatsApp Channel' },
            { pattern: /t\.me\/[A-Za-z0-9_]+/i, type: 'Telegram' },
            { pattern: /https?:\/\/\S+|www\.\S+/i, type: 'External Link' }
        ];

        const detected = linkPatterns.find(p => p.pattern.test(userMessage));
        if (!detected) return;

        const action = config.action || 'delete';
        const participant = message.key.participant || senderId;

        // Execute action
        switch (action) {
            case 'delete':
                try { await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant } }); } catch (e) { console.error(e); }
                await sock.sendMessage(chatId, { text: `⚠️ @${senderId.split('@')[0]}, links are not allowed!\nDetected: ${detected.type}`, mentions: [senderId] });
                break;

            case 'kick':
                try { await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant } }); } catch (e) { console.error(e); }
                if (isGroup) {
                    try {
                        await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                        await sock.sendMessage(chatId, { text: `👢 @${senderId.split('@')[0]} removed for posting links.\nDetected: ${detected.type}`, mentions: [senderId] });
                    } catch (e) {
                        console.error(e);
                        await sock.sendMessage(chatId, { text: `⚠️ @${senderId.split('@')[0]}, links not allowed! Failed to kick.`, mentions: [senderId] });
                    }
                } else {
                    try { await sock.updateBlockStatus(senderId, 'block'); } catch (e) { console.error(e); }
                }
                break;

            case 'warn':
                try { await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant } }); } catch (e) { console.error(e); }
                await sock.sendMessage(chatId, { text: `⚠️ @${senderId.split('@')[0]} - Warning! Links are not allowed.\nDetected: ${detected.type}`, mentions: [senderId] });
                break;
        }
    } catch (error) {
        console.error('❌ Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection
};