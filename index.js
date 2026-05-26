require('./settings')

const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const qrcode = require('qrcode-terminal')

const { rmSync } = require('fs')
const { delay } = require("@whiskeysockets/baileys")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
jidDecode,
jidNormalizedUser,
makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')

const PhoneNumber = require('awesome-phonenumber')

const store = require('./lib/lightweight_store')
store.readFromFile()

const settings = require('./settings')

setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

global.botname = "aurora®"
global.themeemoji = "•"

let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

/*
Memory management
*/

setInterval(() => {
if (global.gc) {
global.gc()
console.log(chalk.gray("Garbage collection executed"))
}
}, 60000)

setInterval(() => {

const used = process.memoryUsage().rss / 1024 / 1024

if (used > 900) {

console.log(chalk.red(`RAM usage too high (${used.toFixed(2)}MB). Restarting.`))

process.exit(1)

}

}, 30000)

let phoneNumber = ''

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY
? readline.createInterface({ input: process.stdin, output: process.stdout })
: null

const question = (text) => {

if (rl) {
return new Promise(resolve => rl.question(text, resolve))
}

return Promise.resolve(settings.ownerNumber || '')

}

async function startXeonBotInc() {

try {

const { version } = await fetchLatestBaileysVersion()

const { state, saveCreds } = await useMultiFileAuthState("./session")

const msgRetryCounterCache = new NodeCache()

const XeonBotInc = makeWASocket({

version,

logger: pino({ level: "silent" }),

printQRInTerminal: !pairingCode,

browser: ["Mozilla", "Fedora", "7.0.7"],

auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
},

markOnlineOnConnect: true,

syncFullHistory: false,

msgRetryCounterCache,

defaultQueryTimeoutMs: 60000,

connectTimeoutMs: 60000,

keepAliveIntervalMs: 10000,

getMessage: async (key) => {

let jid = jidNormalizedUser(key.remoteJid)

let msg = await store.loadMessage(jid, key.id)

return msg?.message || ""

}

})

store.bind(XeonBotInc.ev)

XeonBotInc.ev.on("creds.update", saveCreds)

XeonBotInc.public = true

/*
Message listener
*/

XeonBotInc.ev.on("messages.upsert", async (chatUpdate) => {

try {

const mek = chatUpdate.messages[0]

if (!mek.message) return

/*
Unwrap ephemeral
*/

if (mek.message?.ephemeralMessage) {
mek.message = mek.message.ephemeralMessage.message
}

/*
Unwrap viewOnce
*/

if (mek.message?.viewOnceMessage) {
mek.message = mek.message.viewOnceMessage.message
}

/*
STATUS HANDLER
*/
if (mek.key?.remoteJid === 'status@broadcast') {
    try {
        await handleStatus(XeonBotInc, { messages: [mek] })
        console.log('STATUS DETECTED FROM:', mek.key.participant ?? mek.key.remoteJid)
    } catch (err) {
        console.error('Status handler error:', err)
    }
    return
    }

/*
Skip system messages
*/

if (mek.key?.id?.startsWith("BAE5") && mek.key.id.length === 16) return

/*
Normal messages
*/

await handleMessages(XeonBotInc, chatUpdate, true)

} catch (err) {

console.log("messages.upsert error:", err)

}

})

/*
Contact updates
*/

XeonBotInc.ev.on("contacts.update", update => {

for (let contact of update) {

let id = XeonBotInc.decodeJid(contact.id)

if (store && store.contacts) {

store.contacts[id] = { id, name: contact.notify }

}

}

})
const antiCallNotified = new Set()
XeonBotInc.ev.on('call', async (calls) => {
    try {
        const { readState: readAnticallState } = require('./commands/anticall')
        const state = readAnticallState()
        if (!state.enabled) return
        
        for (const call of calls) {
            const callerJid = call.from || call.peerJid || call.chatId
            if (!callerJid) continue
            
            // Try to reject the call
            try {
                if (typeof XeonBotInc.rejectCall === 'function' && call.id) {
                    await XeonBotInc.rejectCall(call.id, callerJid)
                } else if (typeof XeonBotInc.sendCallOfferAck === 'function' && call.id) {
                    await XeonBotInc.sendCallOfferAck(call.id, callerJid, 'reject')
                }
            } catch (err) {
                console.error('Error rejecting call:', err)
            }

            if (!antiCallNotified.has(callerJid)) {
    antiCallNotified.add(callerJid)
    setTimeout(() => antiCallNotified.delete(callerJid), 60000)

    console.log(`Call rejected from ${callerJid}`)
            }
        }
    } catch (e) {
        console.error('Anticall handler error:', e)
    }
})
/*
Decode JID
*/

XeonBotInc.decodeJid = (jid) => {

if (!jid) return jid

if (/:\d+@/gi.test(jid)) {

let decode = jidDecode(jid) || {}

return decode.user && decode.server
? decode.user + '@' + decode.server
: jid

}

return jid

}

/*
Connection updates
*/

XeonBotInc.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect, qr } = update

if (qr) {

console.log(chalk.yellow("Scan QR code"))

qrcode.generate(qr, { small: true })

}

if (connection === "connecting") {

console.log(chalk.yellow("Connecting to WhatsApp"))

}

if (connection === "open") {

console.log(chalk.green("Bot connected"))

try {

const botNumber = XeonBotInc.user.id.split(':')[0] + "@s.whatsapp.net"

await XeonBotInc.sendMessage(botNumber, {

text: `🤖 ${global.botname} is now ONLINE`

})

} catch {}

}

if (connection === "close") {

const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode

console.log(chalk.red("Connection closed:", statusCode))

if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {

rmSync("./session", { recursive: true, force: true })

console.log("Session deleted. Re-login required.")

}

console.log("Reconnecting in 5 seconds")

await delay(5000)

startXeonBotInc()

}

})

/*
Group participant updates
*/

XeonBotInc.ev.on("group-participants.update", async (update) => {

await handleGroupParticipantUpdate(XeonBotInc, update)

})

return XeonBotInc

}

catch (error) {

console.log("Startup error:", error)

await delay(5000)

startXeonBotInc()

}

}

startXeonBotInc()

/*
Global error protection
*/

process.on("uncaughtException", err => {

console.log("Uncaught Exception:", err)

})

process.on("unhandledRejection", err => {

console.log("Unhandled Rejection:", err)

})