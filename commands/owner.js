// commands/owner.js
const settings = require('../settings.js');

async function ownerCommand(sock, chatId, message) {
    try {
        const ownerInfo = `
╭━━━〔 👑 *BOT OWNER* 〕━━━╮
│ 🧑‍💻 *Name*   : ${settings.botOwner || 'Aura'}
│ 📞 *Number* : wa.me/${settings.ownerNumber || '254113334497'}
│ 🌐 *Github* : ${settings.github || 'https://github.com/aura7822'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ Contact the owner for support or collaboration!
        `.trim();

        await sock.sendMessage(chatId, { text: ownerInfo }, { quoted: message });

        // optional: auto-delete after 200s
        setTimeout(async () => {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: true,
                    id: message.key.id,
                    participant: message.key.participant
                }
            });
        }, 200 * 1000);

    } catch (error) {
        console.error("Error in owner command:", error);
        await sock.sendMessage(chatId, { text: '❌ Failed to load owner info.' });
    }
}

module.exports = ownerCommand;
