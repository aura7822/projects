const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isGroup, isSenderAdmin, message) {
    try {
        if (isGroup && !isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.trim().split(' ').slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `\`\`\`ANTILINK SETUP
${prefix}antilink on <group|private|both>
${prefix}antilink off
${prefix}antilink set <delete|kick|warn>
${prefix}antilink setmsg <group|private|both|invites> <text>
${prefix}antilink status
\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on': {
                const scope = args[1]?.toLowerCase() || 'group';
                if (!['group', 'private', 'both'].includes(scope)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid scope. Use group, private, or both._*' }, { quoted: message });
                    return;
                }

                const result = await setAntilink(chatId, {
                    enabled: true,
                    action: 'delete',
                    scope,
                    messages: {
                        group: '⚠️ Links are not allowed in this group.',
                        private: '⚠️ Do not send links in private chat!',
                        both: '⚠️ Links are prohibited here.',
                        invites: '🚫 The owner doesn’t accept group invites or promotions.',
                    }
                });

                await sock.sendMessage(chatId, {
                    text: result ? `*_Antilink turned ON for ${scope}_*` : '*_Failed to enable Antilink_*',
                }, { quoted: message });
                break;
            }

            case 'off': {
                await removeAntilink(chatId);
                await sock.sendMessage(chatId, { text: '*_Antilink turned OFF_*' }, { quoted: message });
                break;
            }

            case 'set': {
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid action. Choose delete, kick, or warn._*' }, { quoted: message });
                    return;
                }

                const current = await getAntilink(chatId);
                if (!current?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Enable Antilink first using .antilink on_*' }, { quoted: message });
                    return;
                }

                await setAntilink(chatId, { ...current, action: setAction });
                await sock.sendMessage(chatId, { text: `*_Antilink action set to ${setAction}_*` }, { quoted: message });
                break;
            }

            case 'setmsg': {
                const target = args[1]?.toLowerCase();
                if (!['group', 'private', 'both', 'invites'].includes(target)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid type. Use group, private, both, or invites._*' }, { quoted: message });
                    return;
                }

                const customMessage = args.slice(2).join(' ');
                if (!customMessage) {
                    await sock.sendMessage(chatId, { text: `Usage: ${prefix}antilink setmsg ${target} <message>` }, { quoted: message });
                    return;
                }

                const current = await getAntilink(chatId) || { messages: {} };
                current.messages[target] = customMessage;

                await setAntilink(chatId, current);
                await sock.sendMessage(chatId, { text: `*_Custom message for ${target} set successfully!_*` }, { quoted: message });
                break;
            }

            case 'status': {
                const state = await getAntilink(chatId);
                if (!state) {
                    await sock.sendMessage(chatId, { text: '*_Antilink is OFF_*' }, { quoted: message });
                    return;
                }

                const msg = `*_ANTILINK STATUS_*\nStatus: ON\nScope: ${state.scope}\nAction: ${state.action}\n\n*Messages:*\n- Group: ${state.messages?.group || 'Default'}\n- Private: ${state.messages?.private || 'Default'}\n- Both: ${state.messages?.both || 'Default'}\n- Invites: ${state.messages?.invites || 'Default'}`;
                await sock.sendMessage(chatId, { text: msg }, { quoted: message });
                break;
            }

            default:
                await sock.sendMessage(chatId, { text: '*_Invalid command. Use .antilink for help._*' }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in Antilink Command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing Antilink command_*' }, { quoted: message });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId, isGroup) {
    try {
        const config = await getAntilink(chatId);
        if (!config?.enabled) return;

        // Respect scope
        if ((isGroup && config.scope === 'private') || (!isGroup && config.scope === 'group')) return;

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
           
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        const invitePatterns = /(invitation|invite|join).*?(group|whatsapp|channel)/i;

        const isInvite = invitePatterns.test(userMessage);
        const isLink = Object.values(linkPatterns).some((pattern) => pattern.test(userMessage));

        if (!isInvite && !isLink) return;

        const warningMsg = isInvite
            ? (config.messages?.invites || '🚫 `The owner doesn’t accept group invites or promotions`.')
            : (isGroup
                ? (config.messages?.group || '⚠️ Links are not allowed in this group!')
                : (config.messages?.private || '⚠️ *PROTECTION PROTOCOL*\n`This account doesnt accept links`'));

        const mentionedJidList = [senderId];

        if (config.action === 'delete') {
            try {
                await sock.sendMessage(chatId, {
                    delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId },
                });
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }

        if (config.action === 'kick' && isGroup) {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `@${senderId.split('@')[0]} was removed for ${isInvite ? 'sending group invites' : 'sending a link'}.`,
                mentions: mentionedJidList,
            });
        } else if (config.action === 'warn') {
            await sock.sendMessage(chatId, { text: warningMsg, mentions: mentionedJidList });
        }
    } catch (error) {
        console.error('Error in handleLinkDetection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
