// commands/portfolio.js
const settings = require('../settings'); // Make sure your settings file has a portfolioLink

module.exports = {
    name: "portfolio",
    description: "Send a link to the bot owner's web portfolio",
    category: "info",
    usage: ".portfolio",
    
    async execute(sock, chatId, userMessage, message) {
        try {
            const portfolioLink = settings.portfolioLink || "https://bespoke-phoenix-133366.netlify.app/";
            const ownerName = settings.botOwner || "Bot Owner";

            const displayText = `
╔══════════════════════╗
║   🌐 *PORTFOLIO*     ║
╠══════════════════════╣
║ 👤 *Owner:* ${ownerName}
║ 🔗 *Portfolio Link:*
║ ${portfolioLink}
╠══════════════════════╣
║ 📌 Tap the link above to view the full portfolio
╚══════════════════════╝
`;

            await sock.sendMessage(chatId, {
                text: displayText,
                contextInfo: {
                    externalAdReply: {
                        title: `${ownerName}'s Portfolio`,
                        body: "Click to view projects and work samples",
                        thumbnailUrl: "https://i.imgur.com/yourThumbnail.jpg", // Optional portfolio image
                        mediaType: 1,
                        sourceUrl: portfolioLink
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error("❌ Portfolio command error:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to fetch portfolio link. Please try again later." 
            }, { quoted: message });
        }
    }
};