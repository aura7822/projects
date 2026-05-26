const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    try {

        const ownerNumberRaw = settings.ownerNumber || '';
        const ownerNumber = ownerNumberRaw.replace(/\D/g, '');
        const ownerJid = ownerNumber + "@s.whatsapp.net";

        const ownerName = settings.botOwner || "Bot Owner";
        const botName = settings.botName || "Aurora®";

        const formattedNumber = formatPhoneNumber(ownerNumber);
        const waLink = `https://wa.me/${ownerNumber}`;

        // Try fetching owner's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(ownerJid, 'image');
        } catch {
            profilePic = "https://i.imgur.com/6VBx3io.png"; // fallback image
        }

        const displayText = `
╔══════════════════════╗
║        💁🏿 OWNER       ║
╠══════════════════════╣
║  ┏━━━━━━━━━━━━━━━━┓
║  ┃  ${ownerName}
║  ┗━━━━━━━━━━━━━━━━┛
║
║  📞 +${formattedNumber}
║  🤖 ${botName}
║
║  🔗 Chat: ${waLink}
║
║  💬 Tap contact below
║
║  ✨ Bot crafted by ${ownerName}
╚══════════════════════╝
`.trim();

        const vcard =
`BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${botName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}
END:VCARD`;

        // Send image + owner card
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: displayText
        }, { quoted: message });

        // Send contact card
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: message });

    } catch (err) {
        console.error("Owner command error:", err);

        await sock.sendMessage(chatId, {
            text: "❗ Unable to fetch owner information right now."
        }, { quoted: message });
    }
}

function formatPhoneNumber(number) {

    const cleaned = number.replace(/\D/g, '');

    if (cleaned.length <= 3) return cleaned;

    if (cleaned.length <= 6)
        return `${cleaned.slice(0,3)} ${cleaned.slice(3)}`;

    if (cleaned.length <= 10)
        return `${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;

    return `${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6,9)} ${cleaned.slice(9)}`;
}

module.exports = ownerCommand;