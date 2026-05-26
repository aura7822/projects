const fs = require('fs')
const path = require('path')
const isOwnerOrSudo = require('../lib/isOwner')
// 24 July 2005 00:00:00 UTC
const timestampNow = Math.floor(new Date('2005-07-24T00:00:00Z').getTime() / 1000)
// = 1122163200
const configPath = path.join(__dirname, '../data/autoStatus.json')

// ── In-memory config cache (avoids readFileSync on every status event)
let _config = null

function readConfig() {
    if (_config) return _config
    try {
        _config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch {
        _config = { enabled: false, reactOn: false }
    }
    return _config
}

function saveConfig(config) {
    _config = config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

// ── Initialise config file if absent
if (!fs.existsSync(configPath)) {
    saveConfig({ enabled: false, reactOn: false })
}

// ── Reactions pool
const reactions = ['💰', '🦋', '🇰🇪']

// Fisher-Yates shuffle — no bias
function getRandomReactions() {
    const arr = [...reactions]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr[0]
}

// ── React to a status immediately — no loop delay
async function reactToStatus(sock, key) {

const config = readConfig()

if (!config.reactOn) return

try {

const chosen = getRandomReactions(3)

for (const emoji of chosen) {

await sock.relayMessage(
'status@broadcast',
{
reactionMessage:{
key:{
remoteJid:'status@broadcast',
id:key.id,
participant:key.participant,
fromMe:false
},
text:emoji
}
},
{
messageId:key.id,
statusJidList:[key.participant]
}
)

await new Promise(r=>setTimeout(r,100))

}

}

catch(err){

console.log("Reaction Error:",err.message)

}

}
async function handleStatus(sock, update) {
    if (!readConfig().enabled) return

    const messages = update.messages
    if (!messages?.length) return

    const FAKE_TIMESTAMP = Math.floor(new Date('2005-07-24T00:00:00Z').getTime() / 1000)

    for (const msg of messages) {
        const key = msg?.key
        if (!key || key.remoteJid !== 'status@broadcast' || key.fromMe) continue

        try {
            if (typeof sock.readMessages === 'function') {
                await sock.readMessages([key])
            }
            if (typeof sock.sendReceipt === 'function') {
                await sock.sendReceipt(
                    'status@broadcast',
                    key.participant,
                    [key.id],
                    'read',
                    FAKE_TIMESTAMP
                )
            }
            if (typeof sock.sendStatusSeen === 'function') {
                await sock.sendStatusSeen({ ...key, timestamp: FAKE_TIMESTAMP })
            }
        } catch (err) {
            console.error('[AutoStatus] View error:', err.message)
        }

        try {
            await reactToStatus(sock, key, FAKE_TIMESTAMP)
        } catch (err) {
            console.error('[AutoStatus] React error:', err.message)
        }
    }
}
async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId)

        if (!msg.key.fromMe && !isOwner) {
            return sock.sendMessage(chatId, { text: '❌ Owner only command' })
        }

        let config = readConfig()

        if (!args || args.length === 0) {
            return sock.sendMessage(chatId, {
                text:
`🔄 *Auto Status Settings*

📱 Auto View : ${config.enabled  ? '✅ enabled' : '❌ disabled'}
💫 Reactions : ${config.reactOn  ? '✅ enabled' : '❌ disabled'}

*Commands*
.autostatus on
.autostatus off
.autostatus react on
.autostatus react off`
            })
        }

const cmd = args[0].toLowerCase()

if (cmd === "on") {

config.enabled = true

}

else if (cmd === "off") {

config.enabled = false

}

else if (cmd === "react") {

if (!args[1]) {

return sock.sendMessage(chatId,{
text:'Use: .autostatus react on/off'
})

}

config.reactOn = args[1].toLowerCase() === "on"

}

saveConfig(config)

        await sock.sendMessage(chatId, {
            text:
`✅ Settings updated

📱 Auto View : ${config.enabled  ? '✅ enabled' : '❌ disabled'}
💫 Reactions : ${config.reactOn  ? '✅ enabled' : '❌ disabled'}`
        })

    } catch (err) {
        console.error('[AutoStatus] Command error:', err)
        sock.sendMessage(chatId, { text: '❌ Error updating auto status settings' })
    }
}

module.exports = { autoStatusCommand, handleStatus }