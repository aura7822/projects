// commands/toggle.js
let botActive = true;

module.exports = {
  name: "toggle",
  description: "Turn bot on/off without shutting it down (owner only)",
  category: "system",

  async execute(sock, chatId, userMessage, sender) {
    try {
      const owners = ["254113334497@s.whatsapp.net"]; // replace with your ID

      if (!owners.includes(sender)) {
        await sock.sendMessage(chatId, { text: "❌ You are not authorized to use this command." });
        return;
      }

      const arg = userMessage.split(" ")[1];
      if (arg === "off") {
        botActive = false;
        await sock.sendMessage(chatId, { text: "✅ Bot has been *enabled* Commands will be processed." });
      } else if (arg === "on") {
        botActive = true;
        await sock.sendMessage(chatId, { text: "🚫 Bot has been *disabled*. No commands will be processed." });
      } else {
        await sock.sendMessage(chatId, { text: "⚡ Usage: `.hibernate on` or `.hibernate off`" });
      }
    } catch (err) {
      console.error("Toggle command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to toggle bot." });
    }
  },

  // Expose botActive state so main.js can check
  getStatus: () => botActive
};
