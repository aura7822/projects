

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Active typing timers per chat
const activeTimers = new Map();

// Initialize or read config
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch {
        return { enabled: false };
    }
}

// -------------------- COMMAND HANDLER --------------------
async function autotypingCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            return await sendMessage(sock, chatId, '❌ This command is only available for the owner!');
        }

        const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
            .trim()
            .split(' ')
            .slice(1);

        const config = initConfig();

        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (['on', 'enable'].includes(action)) config.enabled = true;
            else if (['off', 'disable'].includes(action)) config.enabled = false;
            else return await sendMessage(sock, chatId, '❌ Invalid option! Use: .autotyping on/off');
        } else {
            config.enabled = !config.enabled; // toggle
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        await sendMessage(sock, chatId, `✅ Auto-typing has been ${config.enabled ? 'enabled' : 'disabled'}!`);

    } catch (error) {
        console.error('❌ Autotyping command error:', error);
        await sendMessage(sock, chatId, '❌ Error processing command!');
    }
}

// -------------------- CONFIG CHECK --------------------
function isAutotypingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch {
        return false;
    }
}

// -------------------- DM TYPING LOOP --------------------
async function startDMTypingLoop(sock, chatId) {
    if (!isAutotypingEnabled()) return;

    // Clear existing timers
    if (activeTimers.has(chatId)) {
        clearInterval(activeTimers.get(chatId).interval);
        clearTimeout(activeTimers.get(chatId).timeout);
        activeTimers.delete(chatId);
    }

    try {
        await sock.presenceSubscribe(chatId);

        let cycles = 0;
        const maxCycles = 10; // total 100s
        const intervalTime = 10000; // 10s

        await sock.sendPresenceUpdate('composing', chatId);

        const interval = setInterval(async () => {
            try {
                cycles++;
                if (cycles >= maxCycles) return cleanup();

                const nextPresence = (cycles % 2 === 0) ? 'recording' : 'composing';
                await sock.sendPresenceUpdate(nextPresence, chatId);
            } catch (err) {
                console.error('❌ DM typing interval error:', err.message);
            }
        }, intervalTime);

        const timeout = setTimeout(cleanup, maxCycles * intervalTime + 500);

        activeTimers.set(chatId, { interval, timeout });

        async function cleanup() {
            try {
                clearInterval(interval);
                clearTimeout(timeout);
                await sock.sendPresenceUpdate('paused', chatId);
            } catch { }
            activeTimers.delete(chatId);
        }

    } catch (err) {
        console.error(`❌ Error starting DM typing loop for ${chatId}:`, err);
        if (activeTimers.has(chatId)) {
            clearInterval(activeTimers.get(chatId).interval);
            clearTimeout(activeTimers.get(chatId).timeout);
            activeTimers.delete(chatId);
        }
    }
}

// -------------------- MESSAGE AUTOTYPING --------------------
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (!isAutotypingEnabled()) return false;

    try {
        const isGroup = chatId.endsWith('@g.us');

        await sock.presenceSubscribe(chatId);

        if (!isGroup) {
            // DM: full alternating typing loop
            await startDMTypingLoop(sock, chatId);
            return true;
        }

        // Group: adaptive typing
        await sock.sendPresenceUpdate('available', chatId);
        await new Promise(r => setTimeout(r, 500));
        await sock.sendPresenceUpdate('composing', chatId);

        const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
        await new Promise(r => setTimeout(r, typingDelay));

        await sock.sendPresenceUpdate('paused', chatId);
        return true;

    } catch (err) {
        console.error('❌ Error in handleAutotypingForMessage:', err);
        return false;
    }
}

// -------------------- COMMAND TYPING HANDLER --------------------
async function handleAutotypingForCommand(sock, chatId) {
    if (!isAutotypingEnabled()) return false;
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 3000));
        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (err) {
        console.error('❌ Error in handleAutotypingForCommand:', err);
        return false;
    }
}

async function showTypingAfterCommand(sock, chatId) {
    if (!isAutotypingEnabled()) return false;
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 1000));
        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (err) {
        console.error('❌ Error in showTypingAfterCommand:', err);
        return false;
    }
}

// -------------------- HELPER --------------------
async function sendMessage(sock, chatId, text) {
    try {
        await sock.sendMessage(chatId, {
            text,
 
        });
    } catch (err) {
        console.error('❌ sendMessage error:', err);
    }
}

// -------------------- EXPORT --------------------
module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};