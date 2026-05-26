const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map();
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Ensure tmp directory exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

/* ───────────────────────── ENHANCED AESTHETICS ───────────────────────── */

// Enhanced divider styles with Unicode characters
const DIVIDERS = {
    SINGLE: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬',
    DOUBLE: '════════════════════════════',
    STARS: '★·.·´¯`·.·★ ★·.·´¯`·.·★',
    WAVY: '~~~~~~~~~~ ~~~~~~~~~~ ~~~~~~~~~~',
    DOTS: '▪▪▪▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪▪▪▪',
    BOX: '┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅',
    MINIMAL: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
};

const randomDivider = () => {
    const dividersArray = Object.values(DIVIDERS);
    return dividersArray[Math.floor(Math.random() * dividersArray.length)];
};

// Enhanced message type labels with emojis
const messageTypeTag = (type) => {
    const icons = {
        image: '🖼️',
        video: '🎥',
        audio: '🎵',
        sticker: '🏷️',
        text: '📝',
        viewonce: '👁️',
        document: '📄'
    };

    switch (type) {
        case 'image':   return `${icons.image} IMAGE`;
        case 'video':   return `${icons.video} VIDEO`;
        case 'audio':   return `${icons.audio} AUDIO`;
        case 'sticker': return `${icons.sticker} STICKER`;
        case 'document':return `${icons.document} DOCUMENT`;
        default:        return `${icons.text} TEXT`;
    }
};

// Get file size in readable format
const getReadableFileSize = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        const size = stats.size;
        if (size < 1024) return size + ' B';
        if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
    } catch {
        return 'Unknown size';
    }
};

// Folder size in MB (enhanced)
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let total = 0;
        for (const f of files) {
            const p = path.join(folderPath, f);
            if (fs.statSync(p).isFile()) {
                total += fs.statSync(p).size;
            }
        }
        return total / (1024 * 1024);
    } catch {
        return 0;
    }
};

// Auto-clean temp folder with enhanced logging
const cleanTempFolderIfLarge = () => {
    try {
        const size = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (size > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const f of files) {
                fs.unlinkSync(path.join(TEMP_MEDIA_DIR, f));
            }
            console.log(`🧹 Cleaned temp folder (was ${size.toFixed(1)} MB)`);
        }
    } catch {}
};

setInterval(cleanTempFolderIfLarge, 60 * 1000);

/* ───────────────────────── CONFIG ───────────────────────── */

const loadConfig = () => {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false, logDeletions: true };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch {
        return { enabled: false, logDeletions: true };
    }
};

const saveConfig = (cfg) => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
    } catch {}
};

/* ───────────────────────── COMMAND ───────────────────────── */

const isOwnerOrSudo = require('../lib/isOwner');

async function handleAntideleteCommand(sock, chatId, message, match) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

    if (!message.key.fromMe && !isOwner) {
        return sock.sendMessage(chatId, {
            text: '❌ Only the bot owner can use this command.'
        }, { quoted: message });
    }

    const config = loadConfig();

    if (!match) {
        const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
        const divider = DIVIDERS.BOX;
        
        return sock.sendMessage(chatId, {
            text:
`${divider}
🔍 *ANTIDELETE SYSTEM*
${divider}

📊 *STATUS:* ${status}

📋 *COMMANDS:*
┣ ➤ *.antidelete on*  - Enable anti-delete
┣ ➤ *.antidelete off* - Disable anti-delete
┗ ➤ *.antidelete log* - Toggle deletion logging

ℹ️ When enabled, deleted messages will be sent to your private chat with full details.`
        }, { quoted: message });
    }

    if (match === 'on') {
        config.enabled = true;
        saveConfig(config);
        return sock.sendMessage(chatId, {
            text: `✅ *Anti-delete enabled*\n\nI will now monitor and recover deleted messages.`
        }, { quoted: message });
    }
    else if (match === 'off') {
        config.enabled = false;
        saveConfig(config);
        return sock.sendMessage(chatId, {
            text: `❌ *Anti-delete disabled*\n\nI will no longer monitor deleted messages.`
        }, { quoted: message });
    }
    else if (match === 'log') {
        config.logDeletions = !config.logDeletions;
        saveConfig(config);
        return sock.sendMessage(chatId, {
            text: `📝 *Deletion logging ${config.logDeletions ? 'enabled' : 'disabled'}*`
        }, { quoted: message });
    }
    else {
        return sock.sendMessage(chatId, {
            text: '❌ Invalid command. Use *.antidelete* for help.'
        }, { quoted: message });
    }
}

/* ───────────────────────── STORE MESSAGE ───────────────────────── */

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;
        if (!message.key?.id) return;

        const id = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const timestamp = new Date();

        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;
        let fileName = '';
        let fileSize = '';
        let mimeType = '';

        const viewOnce =
            message.message?.viewOnceMessageV2?.message ||
            message.message?.viewOnceMessage?.message;

        if (viewOnce) {
            isViewOnce = true;
            if (viewOnce.imageMessage) {
                mediaType = 'image';
                content = viewOnce.imageMessage.caption || '';
                const buf = await downloadContentFromMessage(viewOnce.imageMessage, 'image');
                mediaPath = path.join(TEMP_MEDIA_DIR, `vo_${id}.jpg`);
                await writeFile(mediaPath, buf);
                fileSize = getReadableFileSize(mediaPath);
            } else if (viewOnce.videoMessage) {
                mediaType = 'video';
                content = viewOnce.videoMessage.caption || '';
                const buf = await downloadContentFromMessage(viewOnce.videoMessage, 'video');
                mediaPath = path.join(TEMP_MEDIA_DIR, `vo_${id}.mp4`);
                await writeFile(mediaPath, buf);
                fileSize = getReadableFileSize(mediaPath);
            }
        } else if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buf = await downloadContentFromMessage(message.message.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.jpg`);
            await writeFile(mediaPath, buf);
            fileSize = getReadableFileSize(mediaPath);
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buf = await downloadContentFromMessage(message.message.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.mp4`);
            await writeFile(mediaPath, buf);
            fileSize = getReadableFileSize(mediaPath);
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            const buf = await downloadContentFromMessage(message.message.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.${message.message.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3'}`);
            await writeFile(mediaPath, buf);
            fileSize = getReadableFileSize(mediaPath);
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            const buf = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.webp`);
            await writeFile(mediaPath, buf);
            fileSize = getReadableFileSize(mediaPath);
        } else if (message.message?.documentMessage) {
            mediaType = 'document';
            fileName = message.message.documentMessage.fileName || 'document';
            const buf = await downloadContentFromMessage(message.message.documentMessage, 'document');
            const ext = path.extname(fileName) || '.bin';
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}${ext}`);
            await writeFile(mediaPath, buf);
            fileSize = getReadableFileSize(mediaPath);
        }

        messageStore.set(id, {
            sender,
            content,
            mediaType,
            mediaPath,
            fileName,
            fileSize,
            isViewOnce,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: timestamp.toISOString(),
            rawTimestamp: timestamp
        });

        // Auto-clean old messages (keep last 100)
        if (messageStore.size > 100) {
            const keys = Array.from(messageStore.keys());
            const oldestKey = keys[0];
            const oldestMsg = messageStore.get(oldestKey);
            if (oldestMsg.mediaPath && fs.existsSync(oldestMsg.mediaPath)) {
                try { fs.unlinkSync(oldestMsg.mediaPath); } catch {}
            }
            messageStore.delete(oldestKey);
        }

    } catch (err) {
        console.error('❌ storeMessage error:', err);
    }
}

/* ───────────────────────── REVOKE HANDLER ───────────────────────── */

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        const msgId = revocationMessage.message?.protocolMessage?.key?.id;
        if (!msgId) return;

        const deletedBy =
            revocationMessage.participant ||
            revocationMessage.key?.participant ||
            revocationMessage.key?.remoteJid;

        const original = messageStore.get(msgId);
        if (!original) return;

        const owner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (deletedBy === owner) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const deletedByName = deletedBy.split('@')[0];
        
        // Get group info if applicable
        let groupName = '';
        let groupParticipants = 0;
        if (original.group) {
            try {
                const groupMetadata = await sock.groupMetadata(original.group);
                groupName = groupMetadata.subject;
                groupParticipants = groupMetadata.participants.length;
            } catch {}
        }

        const divider1 = randomDivider();
        const divider2 = randomDivider();
        const typeLabel = messageTypeTag(original.mediaType || 'text');
        const viewOnceIcon = original.isViewOnce ? '👁️ ' : '';
        const timeString = original.rawTimestamp 
            ? original.rawTimestamp.toLocaleString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
              })
            : new Date().toLocaleTimeString();
        const dateString = original.rawTimestamp
            ? original.rawTimestamp.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
            : new Date().toLocaleDateString();

        // Build enhanced report
        let report = 
`${divider1}
🔒 *ANTI-DELETE REPORT* 🔒
${divider1}

📊 *MESSAGE INFO*
┣ 📁 Type: ${viewOnceIcon}${typeLabel}
┣ 📎 ID: \`${msgId.substring(0, 8)}...\`
┗ 📅 Time: ${dateString} at ${timeString}

👥 *PARTICIPANTS*
┣ 🗑️ Deleted by: @${deletedByName}
┣ ✍️ Original sender: @${senderName}
┗ 📞 Sender number: ${sender}`;

        if (groupName) {
            report += `\n\n👥 *GROUP INFO*
┣ 📛 Name: ${groupName}
┗ 👤 Members: ${groupParticipants}`;
        }

        if (original.fileSize) {
            report += `\n\n📦 *FILE INFO*
┗ 📊 Size: ${original.fileSize}`;
        }

        if (original.content) {
            // Truncate very long content
            const displayContent = original.content.length > 500 
                ? original.content.substring(0, 500) + '...' 
                : original.content;
            
            report += 
`\n\n${divider2}
💬 *DELETED CONTENT*
${divider2}
${displayContent}`;
        }

        report += 
`\n\n${divider1}
✅ *STATUS: RECOVERED SUCCESSFULLY* ✅
${divider1}`;

        // Send text report
        await sock.sendMessage(owner, {
            text: report,
            mentions: [deletedBy, sender]
        });

        // Send media if exists
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOpts = {
                caption: `📎 Recovered ${original.mediaType} from @${senderName}${original.isViewOnce ? ' (View Once)' : ''}`,
                mentions: [sender]
            };

            try {
                if (original.mediaType === 'image') {
                    await sock.sendMessage(owner, { 
                        image: { url: original.mediaPath }, 
                        ...mediaOpts 
                    });
                }
                else if (original.mediaType === 'video') {
                    await sock.sendMessage(owner, { 
                        video: { url: original.mediaPath }, 
                        ...mediaOpts 
                    });
                }
                else if (original.mediaType === 'audio') {
                    await sock.sendMessage(owner, { 
                        audio: { url: original.mediaPath }, 
                        mimetype: 'audio/mpeg',
                        ...mediaOpts 
                    });
                }
                else if (original.mediaType === 'sticker') {
                    await sock.sendMessage(owner, { 
                        sticker: { url: original.mediaPath }, 
                        ...mediaOpts 
                    });
                }
                else if (original.mediaType === 'document') {
                    await sock.sendMessage(owner, { 
                        document: { url: original.mediaPath },
                        fileName: original.fileName || 'recovered_document',
                        ...mediaOpts 
                    });
                }
            } catch (mediaError) {
                console.error('Error sending recovered media:', mediaError);
                await sock.sendMessage(owner, {
                    text: `⚠️ Failed to send recovered media file. File size: ${original.fileSize || 'Unknown'}`
                });
            }

            // Clean up media file
            try { fs.unlinkSync(original.mediaPath); } catch {}
        }

        // Log deletion if enabled
        if (config.logDeletions) {
            console.log(`🔒 Anti-delete: Recovered ${original.mediaType || 'text'} message from ${senderName} (deleted by ${deletedByName})`);
        }

        messageStore.delete(msgId);

    } catch (err) {
        console.error('❌ handleMessageRevocation error:', err);
    }
}

/* ───────────────────────── STATS COMMAND ───────────────────────── */

async function getAntiDeleteStats(sock, chatId, message) {
    const config = loadConfig();
    const divider = DIVIDERS.BOX;
    
    const stats = 
`${divider}
📊 *ANTI-DELETE STATISTICS*
${divider}

⚙️ Status: ${config.enabled ? '✅ Active' : '❌ Inactive'}
📝 Logging: ${config.logDeletions ? '✅ Enabled' : '❌ Disabled'}
💾 Stored messages: ${messageStore.size}
📁 Temp folder size: ${getFolderSizeInMB(TEMP_MEDIA_DIR).toFixed(1)} MB

${divider}`;

    await sock.sendMessage(chatId, { text: stats }, { quoted: message });
}

/* ───────────────────────── EXPORTS ───────────────────────── */

module.exports = {
    handleAntideleteCommand,
    storeMessage,
    handleMessageRevocation,
    getAntiDeleteStats
};