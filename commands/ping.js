
const os = require('os');
const fs = require('fs');
const path = require('path');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '⚡ Running speed test...' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

        const botInfo = `
╔═▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨═╗
🖥️   ⚡  SYSTEM STATUS ⚡
╚═▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨═╝

┌─⊷ *${settings.botName || 'AURA BOT'}*
│ ⚡ *Ping*       : ${ping} ms
│ ⏱️ *Uptime*     : ${uptimeFormatted}
│ 🔖 *Version*    : v${settings.version}
│ 💻 *Platform*   : ${os.platform()}
│ 🧠 *RAM Used*   : ${(totalRam - freeRam).toFixed(2)} GB / ${totalRam} GB
└───────────────⟢

🟢 *Status:* Online & Fully Operational 🚀
        `.trim();

        const videoPath = path.join(__dirname, '../assets/cover1.mp4');

        if (fs.existsSync(videoPath)) {
            const videoBuffer = fs.readFileSync(videoPath);

            await sock.sendMessage(chatId, {
                video: videoBuffer,
                gifPlayback: true,
                caption: botInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: botInfo }, { quoted: message });
        }

        // Reaction ⚡
        await sock.sendMessage(chatId, { react: { text: "🚀", key: message.key } });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ System check failed.' });
    }
}

module.exports = pingCommand;

