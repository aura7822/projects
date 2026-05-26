// commands/antiinvite.js
const axios = require("axios");
// commands/antiinvite.js
// commands/antiinvite.js
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db/antiinvite.json");

// Ensure db folder + file exist
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}), "utf8");
}

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

module.exports = {
  name: "antiinvite",
  description: "Blocks WhatsApp group invite links and auto-warns users",
  execute: async (sock, chatId, userMessage, sender, isGroup, isGroupAdmin) => {
    const db = loadDB();

    // --- Toggle command (only works in groups) ---
    if (userMessage.startsWith(".antiinvite")) {
      if (!isGroup) {
        return await sock.sendMessage(chatId, {
          text: "⚙️ The `.antiinvite` command only works in *groups*. In private chats, Anti-Invite is always active.",
        });
      }

      const args = userMessage.split(" ")[1];
      if (!isGroupAdmin) {
        return await sock.sendMessage(chatId, {
          text: "❌ Only *group admins* can toggle Anti-Invite.",
        });
      }

      if (args === "on") {
        db[chatId] = true;
        saveDB(db);
        return await sock.sendMessage(chatId, { text: "✅ Anti-Invite has been *enabled* in this group." });
      } else if (args === "off") {
        db[chatId] = false;
        saveDB(db);
        return await sock.sendMessage(chatId, { text: "❌ Anti-Invite has been *disabled* in this group." });
      } else {
        return await sock.sendMessage(chatId, { text: "⚙️ Usage: `.antiinvite on` or `.antiinvite off`" });
      }
    }

    // --- Detect invite links ---
    const inviteRegex = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/g;

    // Always block in DMs, or if group has anti-invite enabled
    if (inviteRegex.test(userMessage)) {
      if (!isGroup || db[chatId]) {
        await sock.sendMessage(chatId, {
          text: `⚠️ *Warning!* @${sender.split("@")[0]}, invite links are not allowed here.`,
          mentions: [sender],
        });
      }
    }
  },
};
