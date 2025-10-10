const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autotyping feature
async function autotypingCommand(sock, chatId, message) {
    try {
        // Check if sender is the owner (bot itself)
        if (!message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'IM AURA',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                     message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                     [];

        const config = initConfig();

        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.enabled = true;
            } else if (action === 'off' || action === 'disable') {
                config.enabled = false;
            } else {
                await sock.sendMessage(chatId, { text: '❌ Invalid option! Use: .autotyping on/off' });
                return;
            }
        } else {
            config.enabled = !config.enabled;
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        await sock.sendMessage(chatId, {
            text: `✅ Auto-typing has been ${config.enabled ? 'enabled' : 'disabled'}!`
        });

    } catch (error) {
        console.error('Error in autotyping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command!' });
    }
}

// Check autotyping status
function isAutotypingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

// Normal messages → long persistent typing/recording (~50s)
async function handleAutotypingForMessage(sock, chatId) {
    if (isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);

            const actions = ['composing', 'recording'];
            const totalDuration = 60000; // 60s
            const switchInterval = 7000; // change every 7s
            let elapsed = 0;

            while (elapsed < totalDuration) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                await sock.sendPresenceUpdate(action, chatId);

                await new Promise(resolve => setTimeout(resolve, switchInterval));
                elapsed += switchInterval;
            }

            await sock.sendPresenceUpdate('paused', chatId);
            return true;

        } catch (error) {
            console.error('❌ Error sending typing/recording indicator:', error);
            return false;
        }
    }
    return false;
}

// Commands → respond immediately, just flash typing bubble
async function handleAutotypingForCommand(sock, chatId) {
    if (isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('composing', chatId);

            await new Promise(resolve => setTimeout(resolve, 1000)); // short 1s
            await sock.sendPresenceUpdate('paused', chatId);

            return true;
        } catch (error) {
            console.error('❌ Error sending command indicator:', error);
            return false;
        }
    }
    return false;
}

// After command execution → optional short typing/recording bubble
async function showTypingAfterCommand(sock, chatId) {
    if (isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);

            const action = Math.random() < 0.7 ? 'composing' : 'recording';
            await sock.sendPresenceUpdate(action, chatId);

            await new Promise(resolve => setTimeout(resolve, 3000)); // quick 3s
            await sock.sendPresenceUpdate('paused', chatId);

            return true;
        } catch (error) {
            console.error('❌ Error sending post-command indicator:', error);
            return false;
        }
    }
    return false;
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
