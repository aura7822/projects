const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "stoic",
  description: "Fetch a random Stoic quote from famous philosophers",
  category: "fun",

  async execute(sock, chatId, userMessage) {
    try {
      // Fetch quote
      const res = await fetch("https://stoic-quotes.com/api/quote");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text, author } = await res.json();
      const caption = `“${text}”\n— ${author}`;

      // Path to your video (MP4 preferred for gifPlayback)
      const videoPath = path.join(__dirname, "../assets/stoic.mp4");

      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);

        // Send as animated GIF (mp4 with gifPlayback)
        await sock.sendMessage(chatId, {
          video: videoBuffer,
          gifPlayback: true,
          caption: caption
        });
      } else {
        // Fallback if file not found
        await sock.sendMessage(chatId, { text: caption });
      }
    } catch (err) {
      console.error("Stoic quote fetch error:", err);
      await sock.sendMessage(chatId, { text: "😞 Sorry, I couldn't fetch a Stoic quote right now." });
    }
  }
};
