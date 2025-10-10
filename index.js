require('./settings');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber');
const { smsg } = require('./lib/myfunc');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");

global.botname = "IM AURA";
global.themeemoji = "•";
global.sudoNumbers = [
    "254113334497@s.whatsapp.net", // Aura (main owner)
    "254785345947@s.whatsapp.net"  // The new sudo user
];

const store = { messages:{}, contacts:{}, chats:{}, bind:()=>{}, loadMessage:async()=>null };

async function startKnightBot() {
    let { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const msgRetryCounterCache = new NodeCache();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        browser: ["FEDORA", "Mozilla", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    // ✅ QR + connection handling
    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(chalk.yellow("\n📡 SCAN THIS QR CODE TO CONNECT:\n"));
            try {
                qrcode.generate(qr, { small: true });
            } catch (e) {
                console.error("QR render failed:", e);
            }
            console.log(chalk.green("\n✅ Scan QR in WhatsApp > Linked Devices\n"));
        }

        if (connection === "open") {
            console.log(chalk.green("✅ Bot connected successfully!\n"));
        }

        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error?.output?.statusCode != 401
        ) {
            startKnightBot();
        }
    });

    // ✅ AntiCall
    const { readState } = require('./commands/anticall');
    sock.ev.on('call', async (calls) => {
        try {
            const anticall = readState();
            if (!anticall.enabled) return;

            for (const call of calls) {
                if (call.status === 'offer') {
                    const callerId = call.from;
                    console.log(`[📵 ANTICALL] Rejecting call from ${callerId}`);
                    try {
                        await sock.rejectCall(call.id, callerId);
                    } catch {
                        await sock.query({
                            tag: 'call',
                            attrs: { to: call.from },
                            content: [{
                                tag: 'reject',
                                attrs: {
                                    'call-id': call.id,
                                    'call-creator': call.from,
                                    'reason': 'busy'
                                }
                            }],
                        });
                    }
                    await sock.sendMessage(callerId, { text: '📵 Please send a message instead of calling.' });
                }
            }
        } catch (err) {
            console.error('Error handling anticall:', err);
        }
    });

    // ✅ Group participant updates
    sock.ev.on("group-participants.update", async (update) => {
        await handleGroupParticipantUpdate(sock, update);
    });

    sock.ev.on("creds.update", saveCreds);

    // ✅ Main message handler
    sock.ev.on("messages.upsert", async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
                ? mek.message.ephemeralMessage.message
                : mek.message;

            const sender = mek.key.participant || mek.key.remoteJid;
            const isSudo = global.sudoNumbers.includes(sender);

            // ✅ Restrict use to sudo users only
            if (!isSudo) {
                await sock.sendMessage(sender, {
                    text: "❌ Only bot owner or approved sudo user can use this bot."
                }, { quoted: mek });
                return;
            }

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(sock, chatUpdate);
                return;
            }

            await handleMessages(sock, chatUpdate, true);
        } catch (err) {
            console.error("Error in messages.upsert:", err);
        }
    });

    return sock;
}

// ✅ Start bot
startKnightBot().catch(err => console.error("Fatal error:", err));

// ✅ Crash handlers
process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));

// ✅ Hot reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
