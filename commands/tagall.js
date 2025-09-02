const isAdmin = require('../lib/isAdmin');  // Move isAdmin to helpers

async function tagAllCommand(sock, chatId, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isSenderAdmin && !isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Only *admins* can use the *.tagall* command.'
            });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: '⚠️ No participants found in the group.' });
            return;
        }

        // Header banner
        let message = `
🎉✨ *_TAG ALL MEMBERS_* ✨🎉
━━━━━━━━━━━━━━━━━━━━━━━\n`;

        // Add members list
        participants.forEach((participant, index) => {
            const num = index + 1;
            message += `🔹 ${num}. @${participant.id.split('@')[0]}\n`;
        });

        // Footer summary
        message += `━━━━━━━━━━━━━━━━━━━━━━━
✅ Total: *${participants.length}* members`;

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: message,
            mentions: participants.map(p => p.id)
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to tag all members.' });
    }
}

module.exports = tagAllCommand;  // Export directly
