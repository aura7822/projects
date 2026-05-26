// commands/zodiac.js
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");

const signCodes = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
  libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12
};

module.exports = {
  name: "zodiac",
  description: "Get daily zodiac horoscope",
  category: "fun",

  async execute(sock, chatId, userMessage) {
    try {
      const args = userMessage.trim().split(" ");
      const sign = args[1]?.toLowerCase();
      const day = args[2]?.toLowerCase() || "today"; // default to today

      if (!sign || !signCodes[sign]) {
        const list = Object.keys(signCodes)
          .map(s => `• ${s.charAt(0).toUpperCase() + s.slice(1)} — \`.zodiac ${s} [today|tomorrow]\``)
          .join("\n");
        return await sock.sendMessage(chatId, { text: `✨ *Zodiac Signs:*\n${list}` });
      }

      const code = signCodes[sign];
      let url = `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-${day}.aspx?sign=${code}`;
      if (day !== "today" && day !== "tomorrow") {
        return await sock.sendMessage(chatId, { text: "⚡ Usage: `.zodiac <sign> [today|tomorrow]`" });
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to access horoscope website");

      const html = await res.text();
      const $ = cheerio.load(html);
      const content = $(".main-horoscope").text().trim();

      if (!content) throw new Error("Horoscope content not found");

      const imgPath = path.join(__dirname, "../assets/zodiac1.jpeg"); // global image
      let message = {
        caption: `🔮 *${sign.toUpperCase()} — ${day.toUpperCase()}*\n\n${content}`
      };

      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        message.image = imgBuffer;
      } else {
        message.text = message.caption; // fallback to text only
      }

      await sock.sendMessage(chatId, message);

    } catch (err) {
      console.error("Zodiac command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Could not fetch horoscope. Please try again later." });
    }
  }
};
