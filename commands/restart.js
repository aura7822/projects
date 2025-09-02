// commands/restart.js
module.exports = {
  name: "restart",
  description: "Restart the bot remotely (owner only)",
  category: "system",

  async execute(sock, chatId, userMessage, sender) {
    try {
      // --- Define bot owners ---
      const owners = ["254113334497@s.whatsapp.net"]; // replace with your WhatsApp ID(s)

      // --- Check if sender is owner ---
      if (!owners.includes(sender)) {
        await sock.sendMessage(chatId, { text: "❌ You are not authorized to restart the bot." });
        return;
      }

      await sock.sendMessage(chatId, { text: "♻️ *Restarting bot*... *Please wait*." });

      // Small delay so the message is delivered before exit
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    } catch (err) {
      console.error("Restart command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to restart bot." });
    }
  }
};
