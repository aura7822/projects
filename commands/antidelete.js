<<<<<<< HEAD
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
=======
const a5_0x5c7d7a=a5_0x403c;(function(_0x1b4e6a,_0x5dd82f){const _0x1cc788=a5_0x403c,_0x102a03=_0x1b4e6a();while(!![]){try{const _0x226519=-parseInt(_0x1cc788(0xf7))/0x1+-parseInt(_0x1cc788(0x121))/0x2+parseInt(_0x1cc788(0x100))/0x3*(parseInt(_0x1cc788(0x124))/0x4)+parseInt(_0x1cc788(0x15b))/0x5+-parseInt(_0x1cc788(0x109))/0x6*(parseInt(_0x1cc788(0x110))/0x7)+-parseInt(_0x1cc788(0x13a))/0x8+parseInt(_0x1cc788(0xfa))/0x9*(parseInt(_0x1cc788(0xe9))/0xa);if(_0x226519===_0x5dd82f)break;else _0x102a03['push'](_0x102a03['shift']());}catch(_0x30def2){_0x102a03['push'](_0x102a03['shift']());}}}(a5_0x130d,0x28eac));const a5_0x137abb=(function(){const _0x51b09b={'ndxIW':function(_0x4d1df8,_0x88005a){return _0x4d1df8!==_0x88005a;},'lMhgB':'ELRuZ'};let _0x536d6b=!![];return function(_0x58bf0b,_0x11cf73){const _0x1dd93f=a5_0x403c,_0x328ec9={'Yjhcr':function(_0x5761af,_0x4f9cff){return _0x51b09b['ndxIW'](_0x5761af,_0x4f9cff);},'XycvN':'BKqDn','vAHTG':_0x1dd93f(0x150)};if(_0x1dd93f(0xf3)===_0x51b09b[_0x1dd93f(0x12f)]){const _0x631336=_0x536d6b?function(){const _0x53b8d1=_0x1dd93f;if(_0x328ec9[_0x53b8d1(0x117)](_0x328ec9[_0x53b8d1(0xdc)],_0x328ec9[_0x53b8d1(0x13e)])){if(_0x11cf73){const _0x19cdd3=_0x11cf73['apply'](_0x58bf0b,arguments);return _0x11cf73=null,_0x19cdd3;}}else return 0x0;}:function(){};return _0x536d6b=![],_0x631336;}else{if(_0x324a5b){const _0x5bdbb5=_0x27726c[_0x1dd93f(0x11d)](_0x25d68d,arguments);return _0xdaa2a7=null,_0x5bdbb5;}}};}()),a5_0x4d3edb=a5_0x137abb(this,function(){const _0x1c23b4=a5_0x403c,_0x20ec51={'GUylH':_0x1c23b4(0x141)};return a5_0x4d3edb[_0x1c23b4(0xed)]()[_0x1c23b4(0x153)](_0x20ec51[_0x1c23b4(0xe7)])[_0x1c23b4(0xed)]()['constructor'](a5_0x4d3edb)[_0x1c23b4(0x153)](_0x1c23b4(0x141));});a5_0x4d3edb();const fs=require('fs'),path=require(a5_0x5c7d7a(0xe5)),{downloadContentFromMessage}=require(a5_0x5c7d7a(0xe0)),{writeFile}=require(a5_0x5c7d7a(0x106)),TEMP_MEDIA_DIR=path[a5_0x5c7d7a(0xe6)](__dirname,a5_0x5c7d7a(0x127));if(!fs[a5_0x5c7d7a(0xe8)](TEMP_MEDIA_DIR))fs[a5_0x5c7d7a(0x15d)](TEMP_MEDIA_DIR,{'recursive':!![]});const messageStore=new Map();function a5_0x403c(_0x5362a1,_0x58e731){const _0x32d419=a5_0x130d();return a5_0x403c=function(_0x4d3edb,_0x137abb){_0x4d3edb=_0x4d3edb-0xd2;let _0x130d4d=_0x32d419[_0x4d3edb];return _0x130d4d;},a5_0x403c(_0x5362a1,_0x58e731);}let ANTIDELETE_ENABLED=!![],CAPTURE_VIEWONCE=!![],DETECT_LINKS=!![];function getFolderSizeMB(_0x82288){const _0x2aacbc=a5_0x5c7d7a,_0x4a0929={'RwqAK':function(_0x355859,_0x3fc95c){return _0x355859/_0x3fc95c;},'BamTG':function(_0x4fa58e,_0xd8e84d){return _0x4fa58e*_0xd8e84d;},'DAhex':function(_0x50bf9b,_0x3c1db7){return _0x50bf9b!==_0x3c1db7;},'JmiPQ':_0x2aacbc(0xf1)};try{return fs[_0x2aacbc(0x137)](_0x82288)['reduce']((_0x49d062,_0x584c9f)=>_0x49d062+fs['statSync'](path['join'](_0x82288,_0x584c9f))[_0x2aacbc(0x119)],0x0)/(0x400*0x400);}catch{return _0x4a0929[_0x2aacbc(0x104)](_0x4a0929[_0x2aacbc(0x11f)],_0x2aacbc(0xf1))?_0x4a0929[_0x2aacbc(0xdd)](_0x5d154b[_0x2aacbc(0x137)](_0xf08412)['reduce']((_0x23f9e9,_0x1e34ba)=>_0x23f9e9+_0x3cc84f['statSync'](_0x406a49['join'](_0x4d8048,_0x1e34ba))['size'],0x0),_0x4a0929['BamTG'](0x400,0x400)):0x0;}}setInterval(()=>{const _0x3c563f=a5_0x5c7d7a,_0x3783a6={'xrWFk':function(_0x289ce5,_0x2f6d61){return _0x289ce5(_0x2f6d61);}};_0x3783a6['xrWFk'](getFolderSizeMB,TEMP_MEDIA_DIR)>0xc8&&fs[_0x3c563f(0x137)](TEMP_MEDIA_DIR)[_0x3c563f(0x140)](_0x5ce942=>fs[_0x3c563f(0xd6)](path[_0x3c563f(0xe6)](TEMP_MEDIA_DIR,_0x5ce942)));},0x3c*0x3e8);function a5_0x130d(){const _0x61647c=['╔══════════════╗\x0a\x20\x20\x20\x20\x20\x20*ANTIDELETE\x20ALERT*\x0a╚══════════════╝\x0a\x0a*👤\x20Sender:*\x20@','fs/promises','MydSO','uvyKe','6UlwRof','imageMessage','NSIqJ','uYdpY','abCxD','gOLpk','AFROG','680050JmbDbZ','CrGij','protocolMessage','containsLink','test','RujgE','audio/mpeg','Yjhcr','boorl','size','OwgDT','audio','\x0a💬\x20Deleted\x20Message:\x0a','apply','endsWith','JmiPQ','naJcb','462030xNagjJ','*\x20from\x20@','get','19852lmHraB','message','error','../tmp','PpVoP','\x20from\x20@','EXLtH','viewOnceMessage','isGroup','WuZfU','🔗\x20Contains\x20Link','lMhgB','GHatc','extendedTextMessage','.mp3','mediaType','.data','reduce','stickerMessage','readdirSync','image','BhMgM','2194712KwAZEf','content','VsOJA','Deleted\x20','vAHTG','.mp4','forEach','(((.+)+)+)+$','\x0a*📱\x20Number:*\x20','UMHSG','split','YsAMn','OQAyz','exports','YPPXa','ldHcu','rliVb','mediaPath','\x0a*🕒\x20Time:*\x20','@s.whatsapp.net','basename','xkpJS','sCCmc','VCJQH','viewOnceMessageV2','search','caption','constructor','MdORo','OaJni','tOWAX','WVSoc','videoMessage','936370RIHefV','documentMessage','mkdirSync','sZkNg','remoteJid','IYCdX','sendMessage','.jpg','cpCYV','statSync','audioMessage','jopUS','cmgZr','user','video','unlinkSync','Antidelete\x20error:','set','participant','WNfPn','sender','XycvN','RwqAK','lHRkE','LxfSO','@whiskeysockets/baileys','rBsYZ','toLocaleString','RAImt','ecTKT','path','join','GUylH','existsSync','10uPdTTm','XFEvy','SAryP','RuwQF','toString','AfUXw','YGhNl','document','fcHpI','text','ELRuZ','key','*👥\x20Group:*\x20','oiMlh','21175lBaSHk','CzPur','conversation','2487987NzBrzZ','.webp','fileName','toISOString','sticker','PRivJ','198sXjAkd','GbwYN','YYzkH','CUlDq','DAhex'];a5_0x130d=function(){return _0x61647c;};return a5_0x130d();}async function downloadMedia(_0x2a822e,_0x3df0f1,_0x433ce2){const _0x2d6c0c=a5_0x5c7d7a,_0x27d727={'PpVoP':'Media\x20download\x20failed:','VCJQH':function(_0x4e3160,_0x3bf115){return _0x4e3160!==_0x3bf115;},'WuZfU':'tIbBI','OQAyz':'mCYYj','uYdpY':function(_0x318684,_0x1234e3,_0x59a2db){return _0x318684(_0x1234e3,_0x59a2db);}};try{if(_0x27d727[_0x2d6c0c(0x151)](_0x27d727[_0x2d6c0c(0x12d)],_0x27d727[_0x2d6c0c(0x146)])){const _0x603393=await _0x27d727[_0x2d6c0c(0x10c)](downloadContentFromMessage,_0x2a822e,_0x3df0f1),_0x23462b=path[_0x2d6c0c(0xe6)](TEMP_MEDIA_DIR,_0x433ce2);return await writeFile(_0x23462b,_0x603393),_0x23462b;}else return _0x1955db[_0x2d6c0c(0x126)](_0x27d727[_0x2d6c0c(0x128)],_0x1e95f2),null;}catch(_0x1f5fb8){return console[_0x2d6c0c(0x126)](_0x27d727[_0x2d6c0c(0x128)],_0x1f5fb8),null;}}async function storeMessage(_0x2d34aa,_0x986bdb){const _0x232319=a5_0x5c7d7a,_0x432f3c={'YYzkH':function(_0x4b54c0,_0x43e39a){return _0x4b54c0(_0x43e39a);},'tOWAX':_0x232319(0x141),'lOhLO':function(_0x313038,_0x211610){return _0x313038*_0x211610;},'EXLtH':'@g.us','MydSO':function(_0x3b01c5,_0x5cea6f){return _0x3b01c5&&_0x5cea6f;},'PRivJ':function(_0x16f170,_0xa3749c){return _0x16f170!==_0xa3749c;},'NSIqJ':_0x232319(0x139),'gOLpk':_0x232319(0x138),'abCxD':function(_0x265d80,_0x200cbc,_0x3f006f,_0x3bd32d){return _0x265d80(_0x200cbc,_0x3f006f,_0x3bd32d);},'lHRkE':'video','xkpJS':_0x232319(0x159),'LxfSO':'audio','AfUXw':_0x232319(0xfe),'GHatc':function(_0x2cb211,_0x20e306,_0x19fec3,_0x410b1d){return _0x2cb211(_0x20e306,_0x19fec3,_0x410b1d);},'CUlDq':'document','GbwYN':function(_0xd591d6,_0x4054d1){return _0xd591d6===_0x4054d1;},'IYCdX':_0x232319(0x108),'naJcb':'JyIiZ','VsOJA':'EMoOK','OaJni':function(_0x1f87f0,_0xe9807f,_0x1fe4dc,_0x5be279){return _0x1f87f0(_0xe9807f,_0x1fe4dc,_0x5be279);},'ctisP':'rBsYZ','XFEvy':function(_0x188e5c,_0x338419,_0x214202,_0x4ad040){return _0x188e5c(_0x338419,_0x214202,_0x4ad040);},'sZkNg':function(_0x477d7e,_0xc63e2){return _0x477d7e!==_0xc63e2;},'CzPur':'roBmy','UMHSG':function(_0x23690b,_0x15380c,_0x43019f,_0x1c5132){return _0x23690b(_0x15380c,_0x43019f,_0x1c5132);},'NJzvH':function(_0xcd00e2,_0x2ec162){return _0xcd00e2&&_0x2ec162;},'RAImt':function(_0x565cad,_0x5551db){return _0x565cad===_0x5551db;},'ldHcu':'Tfbcc','MdORo':_0x232319(0xd2),'ecTKT':function(_0x2112ef,_0x401ea6){return _0x2112ef+_0x401ea6;},'SAryP':_0x232319(0x14d),'AFROG':function(_0x4bce52,_0x45157e){return _0x4bce52===_0x45157e;},'boorl':_0x232319(0x116)};if(!ANTIDELETE_ENABLED||!_0x986bdb?.[_0x232319(0xf4)]?.['id'])return;const _0x55a55e=_0x986bdb[_0x232319(0xf4)]['id'],_0x23c245=_0x986bdb['key'][_0x232319(0xd9)]||_0x986bdb[_0x232319(0xf4)][_0x232319(0x15f)],_0x501335=_0x986bdb[_0x232319(0xf4)][_0x232319(0x15f)][_0x232319(0x11e)](_0x432f3c[_0x232319(0x12a)]);let _0x39fd96='',_0x3d94ef='',_0x3a344d='',_0xfab3d8=![];const _0x3a681c=_0x986bdb['message']?.[_0x232319(0xf9)]||_0x986bdb[_0x232319(0x125)]?.[_0x232319(0x131)]?.[_0x232319(0xf2)]||'',_0x38857d=/(\b(https?:\/\/|www\.)\S+\b|chat\.whatsapp\.com\/\S+|wa\.me\/\S+|t\.me\/\S+)/i,_0x23321c=DETECT_LINKS&&_0x38857d[_0x232319(0x114)](_0x3a681c),_0xb4d1aa=_0x986bdb[_0x232319(0x125)]?.[_0x232319(0x152)]?.[_0x232319(0x125)]||_0x986bdb['message']?.[_0x232319(0x12b)]?.[_0x232319(0x125)],_0x2f3a98=_0x986bdb[_0x232319(0x125)];if(_0x432f3c[_0x232319(0x107)](_0xb4d1aa,CAPTURE_VIEWONCE)){_0xfab3d8=!![];if(_0xb4d1aa[_0x232319(0x10a)]){if(_0x432f3c['PRivJ'](_0x432f3c[_0x232319(0x10b)],_0x232319(0x139))){const _0x3061b5=_0x3dac2a?function(){const _0x2269a0=_0x232319;if(_0x29734d){const _0x922515=_0x2f49d6[_0x2269a0(0x11d)](_0x79bc11,arguments);return _0x2ca963=null,_0x922515;}}:function(){};return _0x20f098=![],_0x3061b5;}else _0x3d94ef=_0x432f3c[_0x232319(0x10e)],_0x39fd96=_0xb4d1aa[_0x232319(0x10a)][_0x232319(0x154)]||'',_0x3a344d=await _0x432f3c[_0x232319(0x10d)](downloadMedia,_0xb4d1aa['imageMessage'],'image',_0x55a55e+_0x232319(0x162));}else{if(_0xb4d1aa['videoMessage'])_0x3d94ef=_0x432f3c[_0x232319(0xde)],_0x39fd96=_0xb4d1aa[_0x232319(0x15a)]['caption']||'',_0x3a344d=await downloadMedia(_0xb4d1aa['videoMessage'],_0x432f3c[_0x232319(0xde)],_0x55a55e+_0x232319(0x13f));else{if(_0xb4d1aa[_0x232319(0x165)])_0x232319(0x111)===_0x432f3c[_0x232319(0x14f)]?_0x432f3c[_0x232319(0x102)](_0x1199f7,_0xb28784)>0xc8&&_0x54c111[_0x232319(0x137)](_0x5b92dc)[_0x232319(0x140)](_0x1c5a45=>_0x58f4e6[_0x232319(0xd6)](_0x9308f5[_0x232319(0xe6)](_0x3ab47e,_0x1c5a45))):(_0x3d94ef=_0x432f3c['LxfSO'],_0x3a344d=await downloadMedia(_0xb4d1aa[_0x232319(0x165)],_0x432f3c['LxfSO'],_0x55a55e+_0x232319(0x132)));else{if(_0xb4d1aa[_0x232319(0x136)])_0x3d94ef=_0x432f3c[_0x232319(0xee)],_0x3a344d=await _0x432f3c[_0x232319(0x130)](downloadMedia,_0xb4d1aa['stickerMessage'],_0x432f3c[_0x232319(0xee)],_0x55a55e+_0x232319(0xfb));else _0xb4d1aa[_0x232319(0x15c)]&&(_0x3d94ef=_0x432f3c['CUlDq'],_0x3a344d=await _0x432f3c[_0x232319(0x10d)](downloadMedia,_0xb4d1aa[_0x232319(0x15c)],_0x432f3c[_0x232319(0x103)],_0xb4d1aa[_0x232319(0x15c)][_0x232319(0xfc)]||_0x55a55e+_0x232319(0x134)));}}}}else{if(_0x2f3a98){if(_0x432f3c[_0x232319(0x101)](_0x432f3c[_0x232319(0x160)],_0x432f3c[_0x232319(0x120)]))return _0x40123c[_0x232319(0xed)]()[_0x232319(0x153)](PjSsLQ[_0x232319(0x158)])[_0x232319(0xed)]()[_0x232319(0x155)](_0x3d85d9)[_0x232319(0x153)](PjSsLQ[_0x232319(0x158)]);else{if(_0x2f3a98[_0x232319(0x10a)]){if(_0x432f3c['VsOJA']!==_0x432f3c[_0x232319(0x13c)]){const _0x3c5b19=_0x5b6d9e['apply'](_0x17cc19,arguments);return _0x3f71b9=null,_0x3c5b19;}else _0x3d94ef=_0x232319(0x138),_0x39fd96=_0x2f3a98[_0x232319(0x10a)][_0x232319(0x154)]||'',_0x3a344d=await downloadMedia(_0x2f3a98['imageMessage'],_0x432f3c[_0x232319(0x10e)],_0x55a55e+_0x232319(0x162));}else{if(_0x2f3a98[_0x232319(0x15a)])_0x3d94ef=_0x432f3c[_0x232319(0xde)],_0x39fd96=_0x2f3a98[_0x232319(0x15a)]['caption']||'',_0x3a344d=await _0x432f3c[_0x232319(0x157)](downloadMedia,_0x2f3a98[_0x232319(0x15a)],_0x432f3c[_0x232319(0xde)],_0x55a55e+'.mp4');else{if(_0x2f3a98[_0x232319(0x165)])_0x432f3c[_0x232319(0xff)](_0x232319(0xe1),_0x432f3c['ctisP'])?_0x1a151a['error']('Antidelete\x20error:',_0xc3b135):(_0x3d94ef=_0x432f3c[_0x232319(0xdf)],_0x3a344d=await _0x432f3c['XFEvy'](downloadMedia,_0x2f3a98[_0x232319(0x165)],_0x432f3c[_0x232319(0xdf)],_0x55a55e+_0x232319(0x132)));else{if(_0x2f3a98[_0x232319(0x136)])_0x3d94ef=_0x432f3c[_0x232319(0xee)],_0x3a344d=await _0x432f3c[_0x232319(0xea)](downloadMedia,_0x2f3a98['stickerMessage'],'sticker',_0x55a55e+_0x232319(0xfb));else{if(_0x2f3a98[_0x232319(0x15c)]){if(_0x432f3c[_0x232319(0x15e)](_0x432f3c[_0x232319(0xf8)],_0x432f3c['CzPur']))try{return _0x52b17f[_0x232319(0x137)](_0x5656d2)[_0x232319(0x135)]((_0x255d92,_0x4fced6)=>_0x255d92+_0xe0b805[_0x232319(0x164)](_0x489a07['join'](_0x3309c7,_0x4fced6))['size'],0x0)/_0x432f3c['lOhLO'](0x400,0x400);}catch{return 0x0;}else _0x3d94ef=_0x432f3c['CUlDq'],_0x3a344d=await _0x432f3c[_0x232319(0x143)](downloadMedia,_0x2f3a98[_0x232319(0x15c)],_0x432f3c[_0x232319(0x103)],_0x2f3a98[_0x232319(0x15c)][_0x232319(0xfc)]||_0x55a55e+'.data');}}}}}_0x39fd96=_0x39fd96||_0x3a681c;}}}messageStore[_0x232319(0xd8)](_0x55a55e,{'content':_0x39fd96,'mediaType':_0x3d94ef,'mediaPath':_0x3a344d,'sender':_0x23c245,'isGroup':_0x501335,'containsLink':_0x23321c,'timestamp':new Date()[_0x232319(0xfd)]()});if(_0x432f3c['NJzvH'](_0xfab3d8,_0x3a344d)){if(_0x432f3c[_0x232319(0xe3)](_0x432f3c[_0x232319(0x149)],_0x432f3c[_0x232319(0x156)]))_0x5186d7[_0x232319(0x137)](_0x4a8d1f)[_0x232319(0x140)](_0x57a12d=>_0x483d7a[_0x232319(0xd6)](_0xa2e193[_0x232319(0xe6)](_0x55833f,_0x57a12d)));else try{const _0x199b47=_0x432f3c[_0x232319(0xe4)](_0x2d34aa['user']['id'][_0x232319(0x144)](':')[0x0],_0x432f3c[_0x232319(0xeb)]),_0x16528f={'caption':'*Anti-ViewOnce\x20'+_0x3d94ef+_0x232319(0x122)+_0x23c245[_0x232319(0x144)]('@')[0x0],'mentions':[_0x23c245]};if(_0x432f3c[_0x232319(0xe3)](_0x3d94ef,_0x432f3c['gOLpk']))await _0x2d34aa[_0x232319(0x161)](_0x199b47,{'image':{'url':_0x3a344d},..._0x16528f});else{if(_0x3d94ef===_0x232319(0xd5))await _0x2d34aa[_0x232319(0x161)](_0x199b47,{'video':{'url':_0x3a344d},..._0x16528f});else{if(_0x432f3c[_0x232319(0x10f)](_0x3d94ef,_0x232319(0x11b)))await _0x2d34aa[_0x232319(0x161)](_0x199b47,{'audio':{'url':_0x3a344d},'mimetype':_0x432f3c[_0x232319(0x118)],..._0x16528f});else{if(_0x432f3c[_0x232319(0x101)](_0x3d94ef,_0x432f3c[_0x232319(0xee)]))await _0x2d34aa[_0x232319(0x161)](_0x199b47,{'sticker':{'url':_0x3a344d},..._0x16528f});else{if(_0x432f3c['GbwYN'](_0x3d94ef,_0x232319(0xf0)))await _0x2d34aa[_0x232319(0x161)](_0x199b47,{'document':{'url':_0x3a344d,'fileName':path[_0x232319(0x14e)](_0x3a344d)},..._0x16528f});}}}}}catch{}}}async function handleMessageRevocation(_0x105041,_0x193102){const _0x12b1a9=a5_0x5c7d7a,_0x18fdce={'YPPXa':function(_0x1189fb,_0x5246dc){return _0x1189fb+_0x5246dc;},'oiMlh':'@s.whatsapp.net','YsAMn':_0x12b1a9(0x12e),'YGhNl':function(_0x3ebdad,_0x3c08a8){return _0x3ebdad+_0x3c08a8;},'Xmymv':'LdGYr','cpCYV':function(_0x12ebbb,_0x4c9101){return _0x12ebbb===_0x4c9101;},'cmgZr':_0x12b1a9(0xd5),'WNfPn':_0x12b1a9(0x11b),'FWksB':_0x12b1a9(0x116),'rliVb':function(_0x3c2173,_0x48400e){return _0x3c2173===_0x48400e;},'RuwQF':_0x12b1a9(0xfe),'OwgDT':'document','RujgE':_0x12b1a9(0xd7)};try{if(!ANTIDELETE_ENABLED)return;const _0x587f4c=_0x193102['message'][_0x12b1a9(0x112)][_0x12b1a9(0xf4)]['id'],_0x2a8bf0=messageStore[_0x12b1a9(0x123)](_0x587f4c);if(!_0x2a8bf0)return;const _0x248714=_0x18fdce[_0x12b1a9(0x148)](_0x105041[_0x12b1a9(0xd4)]['id'][_0x12b1a9(0x144)](':')[0x0],_0x18fdce[_0x12b1a9(0xf6)]),_0x307799=_0x2a8bf0[_0x12b1a9(0xdb)][_0x12b1a9(0x144)]('@')[0x0];let _0x3270eb=_0x12b1a9(0x105)+_0x307799+_0x12b1a9(0x142)+_0x2a8bf0[_0x12b1a9(0xdb)]+_0x12b1a9(0x14c)+new Date()[_0x12b1a9(0xe2)]()+'\x0a'+(_0x2a8bf0[_0x12b1a9(0x12c)]?_0x18fdce[_0x12b1a9(0x148)](_0x12b1a9(0xf5),_0x2a8bf0[_0x12b1a9(0x12c)]):'')+'\x0a'+(_0x2a8bf0[_0x12b1a9(0x113)]?_0x18fdce[_0x12b1a9(0x145)]:'')+'\x0a'+(_0x2a8bf0[_0x12b1a9(0x13b)]?_0x18fdce[_0x12b1a9(0xef)](_0x12b1a9(0x11c),_0x2a8bf0[_0x12b1a9(0x13b)]):'');await _0x105041['sendMessage'](_0x248714,{'text':_0x3270eb,'mentions':[_0x2a8bf0[_0x12b1a9(0xdb)]]});if(_0x2a8bf0[_0x12b1a9(0x133)]&&fs[_0x12b1a9(0xe8)](_0x2a8bf0[_0x12b1a9(0x14b)])){if(_0x18fdce['Xmymv']!==_0x18fdce['Xmymv'])_0x304070[_0x12b1a9(0xd6)](_0x46e9f6[_0x12b1a9(0x14b)]);else{const _0x2bcdc3={'caption':_0x12b1a9(0x13d)+_0x2a8bf0[_0x12b1a9(0x133)]+_0x12b1a9(0x129)+_0x307799,'mentions':[_0x2a8bf0['sender']]};if(_0x18fdce[_0x12b1a9(0x163)](_0x2a8bf0[_0x12b1a9(0x133)],'image'))await _0x105041['sendMessage'](_0x248714,{'image':{'url':_0x2a8bf0[_0x12b1a9(0x14b)]},..._0x2bcdc3});else{if(_0x2a8bf0[_0x12b1a9(0x133)]===_0x18fdce[_0x12b1a9(0xd3)])await _0x105041[_0x12b1a9(0x161)](_0x248714,{'video':{'url':_0x2a8bf0['mediaPath']},..._0x2bcdc3});else{if(_0x18fdce[_0x12b1a9(0x163)](_0x2a8bf0[_0x12b1a9(0x133)],_0x18fdce[_0x12b1a9(0xda)]))await _0x105041[_0x12b1a9(0x161)](_0x248714,{'audio':{'url':_0x2a8bf0[_0x12b1a9(0x14b)]},'mimetype':_0x18fdce['FWksB'],..._0x2bcdc3});else{if(_0x18fdce[_0x12b1a9(0x14a)](_0x2a8bf0[_0x12b1a9(0x133)],_0x18fdce[_0x12b1a9(0xec)]))await _0x105041[_0x12b1a9(0x161)](_0x248714,{'sticker':{'url':_0x2a8bf0[_0x12b1a9(0x14b)]},..._0x2bcdc3});else{if(_0x18fdce[_0x12b1a9(0x163)](_0x2a8bf0[_0x12b1a9(0x133)],_0x18fdce[_0x12b1a9(0x11a)]))await _0x105041[_0x12b1a9(0x161)](_0x248714,{'document':{'url':_0x2a8bf0[_0x12b1a9(0x14b)],'fileName':path[_0x12b1a9(0x14e)](_0x2a8bf0[_0x12b1a9(0x14b)])},..._0x2bcdc3});}}}}try{fs[_0x12b1a9(0xd6)](_0x2a8bf0['mediaPath']);}catch{}}}messageStore['delete'](_0x587f4c);}catch(_0x414ce5){console['error'](_0x18fdce[_0x12b1a9(0x115)],_0x414ce5);}}module[a5_0x5c7d7a(0x147)]={'storeMessage':storeMessage,'handleMessageRevocation':handleMessageRevocation};
>>>>>>> be284a9448a5fb08686a9dd181cc44b9a392bbae
