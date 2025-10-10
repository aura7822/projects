const fs = require('fs');

const ANTICALL_PATH = './data/anticall.json';

// Helper: read current anticall state
function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
        const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { enabled: !!data.enabled };
    } catch {
        return { enabled: false };
    }
}

// Helper: write anticall state
function writeState(enabled) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    } catch {}
}

// The .anticall command logic
async function anticallCommand(sock, chatId, message, args) {
    const state = readState();
    const sub = (args || '').trim().toLowerCase();

    if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
        await sock.sendMessage(chatId, { text: '*ANTICALL*\n\n.anticall on  - Enable auto-decline for calls\n.anticall off - Disable anticall\n.anticall status - Show current status' }, { quoted: message });
        return;
    }

    if (sub === 'status') {
        await sock.sendMessage(chatId, { text: `Anticall is currently *${state.enabled ? 'ON' : 'OFF'}*.` }, { quoted: message });
        return;
    }

    const enable = sub === 'on';
    writeState(enable);
    await sock.sendMessage(chatId, { text: `Anticall is now *${enable ? 'ENABLED' : 'DISABLED'}*.` }, { quoted: message });
}

// The actual call handler (declines calls)
async function handleIncomingCall(sock, calls) {
    try {
        const state = readState();
        if (!state.enabled) return;

        for (const call of calls) {
            if (call.status === 'offer') { // Someone is calling
                const callerId = call.from;
                console.log(`[📵 ANTICALL] Declining call from ${callerId}`);

                try {
                    // ✅ Preferred: works on Baileys v6.7.6+
                    await sock.rejectCall(call.id, callerId);
                } catch {
                    // 🧩 Fallback for older Baileys builds
                    await sock.query({
                        tag: 'call',
                        attrs: { to: call.from },
                        content: [
                            {
                                tag: 'reject',
                                attrs: {
                                    'call-id': call.id,
                                    'call-creator': call.from,
                                    'reason': 'busy',
                                },
                            },
                        ],
                    });
                }

                // Send polite message
                await sock.sendMessage(callerId, {
                    text: '🚫 Calls are not allowed. Please send a message instead.'
                });
            }
        }
    } catch (err) {
        console.error('Error in handleIncomingCall:', err);
    }
}

module.exports = { anticallCommand, handleIncomingCall, readState };
