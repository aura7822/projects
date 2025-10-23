const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/autoStatus.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        enabled: false,
        reactOn: false
    }));
}

// --- Small helper for random human-like delays ---
function randomDelay(min = 1500, max = 4000) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!' });
            return;
        }

        let config = JSON.parse(fs.readFileSync(configPath));

        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            const reactStatus = config.reactOn ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, {
                text: `🔄 *Auto Status Settings*\n\n📱 *Auto Status View:* ${status}\n💫 *Status Reactions:* ${reactStatus}\n\n*Commands:*\n.autostatus on - Enable auto status view\n.autostatus off - Disable auto status view\n.autostatus react on - Enable status reactions\n.autostatus react off - Disable status reactions`
            });
            return;
        }

        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '✅ Auto status view has been enabled!' });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '❌ Auto status view has been disabled!' });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: '❌ Please specify on/off for reactions!\nUse: .autostatus react on/off' });
                return;
            }
            const reactCmd = args[1].toLowerCase();
            config.reactOn = reactCmd === 'on';
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, {
                text: config.reactOn
                    ? '💫 Status reactions have been enabled!'
                    : '❌ Status reactions have been disabled!'
            });
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command! Use:\n.autostatus on/off\n.autostatus react on/off'
            });
        }
    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error occurred while managing auto status!\n' + error.message });
    }
}

function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch {
        return false;
    }
}

async function reactToStatus(sock, statusKey) {
    if (!isStatusReactionEnabled()) return;
    try {
        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: statusKey.id,
                    participant: statusKey.participant || statusKey.remoteJid,
                    fromMe: false
                },
                text: '🇰🇪'
            }
        }, { messageId: statusKey.id });
    } catch (err) {
        console.error('❌ Error reacting to status:', err.message);
    }
}

// --- Queued status handler ---
let statusQueue = [];
let processingQueue = false;

async function processQueue(sock) {
    if (processingQueue) return;
    processingQueue = true;

    while (statusQueue.length > 0) {
        const statusKey = statusQueue.shift();
        let success = false;
        for (let attempt = 1; attempt <= 3 && !success; attempt++) {
            try {
                await sock.readMessages([statusKey]);
                await reactToStatus(sock, statusKey);
                success = true;
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, retrying after 2s...');
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    console.error('❌ Failed reading status:', err.message);
                    break;
                }
            }
        }
        await randomDelay(); // Wait between statuses
    }

    processingQueue = false;
}

async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) return;

        let keys = [];

        if (status.messages?.length > 0) {
            keys = status.messages
                .filter(m => m.key?.remoteJid === 'status@broadcast')
                .map(m => m.key);
        } else if (status.key?.remoteJid === 'status@broadcast') {
            keys = [status.key];
        } else if (status.reaction?.key?.remoteJid === 'status@broadcast') {
            keys = [status.reaction.key];
        }

        if (keys.length > 0) {
            statusQueue.push(...keys);
            processQueue(sock); // process asynchronously
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = { autoStatusCommand, handleStatusUpdate };
