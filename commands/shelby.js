// commands/shelby.js
// commands/shelby.js
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shelby',
    description: 'Sends a random Thomas Shelby quote from Peaky Blinders',
    execute: async (sock, chatId, userMessage) => {
        try {
            const quotes = [
                "You’re not a good man if you don’t do what’s necessary.",
                "I can charm dogs. Gypsy witchcraft. And those I can’t charm, I can kill.",
                "You don’t get what you deserve, you get what you take.",
                "I don’t pay for suits. My suits are on the house or the house burns down.",
                "Sometimes the women have to take over. Like in the war.",
                "I have no limitations.",
                "Fast women and slow ties will ruin your life.",
                "Whiskey, a bit of danger, and business.",
                "Lies travel faster than the truth.",
                "In this world there is no rest — perhaps in the next.",
                "All religion is a foolish answer to a foolish question.",
                "Today it will be me dead or you — and whoever it is will wake up in hell tomorrow.",
                "Everyone’s a whore, Grace. We just sell different parts of ourselves.",
                "In the bleak midwinter, we make our own luck."
            ];

            // Pick a random quote
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

            // Path to your video in assets
            const videoPath = path.join(__dirname, '../assets/shelby.mp4');

            if (fs.existsSync(videoPath)) {
                const videoBuffer = fs.readFileSync(videoPath);

                await sock.sendMessage(chatId, {
                    video: videoBuffer,
                    gifPlayback: true,
                    caption: `🕶️ Thomas Shelby says:\n\n"${randomQuote}"`
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `🕶️ Thomas Shelby says:\n\n"${randomQuote}"` 
                });
            }

        } catch (error) {
            console.error('❌ Error sending Shelby quote:', error);
            await sock.sendMessage(chatId, { text: "❌ Failed to send Shelby quote." });
        }
    }
};
