// commands/anticall.js
const fs = require('fs');
const path = require('path');
const { ownerNumber } = require("../config.js");

let antiCallEnabled = false;

module.exports = {
  name: "anticall",
  description: "Toggle automatic rejection of WhatsApp personal calls (owner only in DM)",
  execute: async (sock, chatId, userMessage, senderId, isGroup) => {
    try {
      // ensure it's only usable in DM with the bot
      if (isGroup) {
        await sock.sendMessage(chatId, { text: "❌ *Only the SuperUserDo can use this command*." });
        return;
      }

      if (senderId !== ownerNumber) {
        await sock.sendMessage(chatId, { text: "❌ *Only the SuperUserDo can use this command*." });
        return;
      }

      const arg = userMessage.split(" ")[1]?.toLowerCase();

      if (!arg || (arg !== "on" && arg !== "off")) {
        await sock.sendMessage(chatId, { text: "⚙️ Usage:\n.anticall on\n.anticall off" });
        return;
      }

      if (arg === "on") {
        antiCallEnabled = true;
        await sock.sendMessage(chatId, { text: "📵 AntiCall is now *enabled* for personal calls." });
      } else {
        antiCallEnabled = false;
        await sock.sendMessage(chatId, { text: "✅ AntiCall is now *disabled*." });
      }
    } catch (error) {
      console.error("Error in .anticall:", error);
      await sock.sendMessage(chatId, { text: "❌ Failed to toggle AntiCall." });
    }
  },

  isEnabled: () => antiCallEnabled,
};
