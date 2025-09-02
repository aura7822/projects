

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const qrcode = require('qrcode-terminal') // ✅ QR printing
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')
const PhoneNumber = require('awesome-phonenumber')
const { smsg } = require('./lib/myfunc')
const { 
    default: makeWASocket,
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")


// Store (basic placeholder for messages, contacts, etc.)
const store = { messages:{}, contacts:{}, chats:{}, bind:()=>{}, loadMessage:async()=>null }

global.botname = "IM AURA"
global.themeemoji = "•"

async function startKnightBot() {
    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        browser: ["Kali", "Brave", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    // ✅ QR code + connection handling
    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(chalk.yellow("\n📡 SCAN THIS QR CODE TO CONNECT:\n"))
            try {
                qrcode.generate(qr, { small: true })   // Pretty QR in terminal
            } catch (e) {
                console.error("QR render failed:", e)
            }
            console.log(chalk.cyan("\n🔑 RAW QR STRING (backup):\n"), qr, "\n")
            console.log(chalk.green("1. Open WhatsApp > Linked Devices"))
            console.log(chalk.green("2. Tap 'Link a Device'"))
            console.log(chalk.green("3. Scan the QR code above\n"))
        }

        if (connection === "open") {
            console.log(chalk.green("✅ Bot connected successfully!\n"))
        }

        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error?.output?.statusCode != 401
        ) {
            startKnightBot()
        }
    })
    
    // Auto-reply when someone tries to call the bot
/*const fs = require("fs");
const path = require("path");

sock.ev.on("call", async (callData) => {
    try {
        for (const call of callData) {
            if (call.status === "offer") { // Incoming call attempt
                const callerId = call.from;

                // Properly resolve the file path
                const gifPath = path.join(__dirname, "assets", "phone.mp4");

                // Auto-reply message with GIF/MP4
                const replyText = `
☎️ *_CALL MESSAGE_*
*Your call was positively received. Please wait as we notify the account holder to call back*.
                `.trim();

               await sock.sendMessage(callerId, {
    video: { url: path.join(__dirname, "assets", "phone.mp4") },
    caption: replyText,
    gifPlayback: true
});

            }
        }
    } catch (err) {
        console.error("Error handling call event:", err);
    }
}); */

    




    
    
    
    
sock.ev.on("call", async (calls) => {
  const antiCall = require("./commands/anticall");

  if (!antiCall.isEnabled()) return;

  for (const c of calls) {
    if (!c.isGroup && !c.isVideo) { // strictly personal calls
      try {
        await sock.rejectCall(c.id);
        await sock.sendMessage(c.from, { 
          text: "📵 *_You cannot call this user at the moment try again later_*." 
        });
      } catch (err) {
        console.error("Error rejecting call:", err);
      }
    }
  }
});




// Listen to new participants
sock.ev.on("group-participants.update", async (update) => {
  await antiBot.handleNewParticipant(sock, update);
});


    sock.ev.on("creds.update", saveCreds)

    // ✅ Message events
    sock.ev.on("messages.upsert", async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
                ? mek.message.ephemeralMessage.message
                : mek.message

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(sock, chatUpdate)
                return
            }
            await handleMessages(sock, chatUpdate, true)
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    sock.ev.on('group-participants.update', async update => {
        await handleGroupParticipantUpdate(sock, update)
    })

    return sock
}

// Start bot
startKnightBot().catch(err => console.error("Fatal error:", err))

process.on('uncaughtException', err => console.error('Uncaught Exception:', err))
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err))

// ✅ Hot reload
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
