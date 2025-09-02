// commands/shutdown.js
// commands/shutdown.js
module.exports = {
  name: "shutdown",
  description: "Completely shut down the bot (owner only)",
  category: "system",

  async execute(sock, chatId, userMessage, sender) {
    try {
      // Normalize sender JID -> just the number
      const normalizedSender = sender.replace(/[^0-9]/g, "");
      const owners = ["254113334497"]; // just your number

      if (!owners.includes(normalizedSender)) {
        await sock.sendMessage(chatId, { text: "❌ *Only _SUDO_ can shut down the bot*." });
        return;
      }

      await sock.sendMessage(chatId, { text: "🛑 Bot is shutting down..." });

      setTimeout(() => process.exit(0), 2000); // kill process
    } catch (err) {
      console.error("Shutdown command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to shut down bot." });
    }
  }
};
