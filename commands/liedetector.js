// commands/liedetector.js
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "liedetector",
  description: "Detects lies (fun scan simulation)",
  execute: async (sock, chatId, userMessage) => {
    try {
      // Extract statement from user input
      const statement = userMessage.slice(12).trim();

      if (!statement) {
        await sock.sendMessage(chatId, { text: "🕵️ Please provide a statement.\nExample: `.liedetector I never lie`" });
        return;
      }

      // Verdicts
      const results = [
        { verdict: "✅ Truth detected!", emoji: "😇" },
        { verdict: "🙉This is just a white lie", emoji: "😱" },
        { verdict: "😶‍🌫️A lie! individual is profession in telling lies", emoji: "😵" },
        { verdict: "❌ Lie detected!", emoji: "🤥" },
        { verdict: "🫵You are good at lying just like your president!", emoji: "🤥" },
        { verdict: "⚖️ Half-truth...", emoji: "😏" },
        { verdict: "🤔 Having a 50/50 chance...", emoji: "🤖" },
        { verdict: "🧐 Seems Suspicious...", emoji: "🧐" },
        { verdict: "👺 Big fat lie!", emoji: "👺" }
      ];
      const result = results[Math.floor(Math.random() * results.length)];

      // Load detector image
      const imagePath = path.join(__dirname, "../assets/liedetector.jpeg");
      let buffer = null;
      try {
        buffer = fs.readFileSync(imagePath);
      } catch {
        console.warn("⚠️ Lie detector image not found, sending text only.");
      }

      // Scan simulation messages
      const scanSteps = [
        "📡 *Initializing lie detector*...",
        "📶 *Analysing waves*...",
        "📊 *Checking truth validity*...",
        "📉 *Checking lie probability*...",
        "🔍 *Summarising results*..."
      ];

      // Send scan steps with small delays
      for (let i = 0; i < scanSteps.length; i++) {
        await sock.sendMessage(chatId, { text: scanSteps[i] });
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay per step
      }

      // Final result with image
      const caption = `🕵️ *Lie Detector Scan Completed* 🕵️\n\n📢 Statement: "${statement}"\n\nResult: *${result.verdict}* ${result.emoji}`;

      if (buffer) {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption
        });
      } else {
        await sock.sendMessage(chatId, { text: caption });
      }

    } catch (err) {
      console.error("❌ Error in liedetector:", err);
      await sock.sendMessage(chatId, { text: "❌ Lie detector malfunctioned. Try again." });
    }
  }
};
