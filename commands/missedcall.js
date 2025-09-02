// commands/missedcall.js
const axios = require("axios");
const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");

let lastMissedCall = null; 
let autoReplyEnabled = false; // default OFF

// Owner(s) JIDs
const owners = ["254113334497@s.whatsapp.net"];

// Normalize JID so it matches owner correctly
function normalizeJid(jid) {
  if (!jid) return "";
  return jid.split(":")[0]; // remove device/session part if present
}

module.exports = {
  name: "missedcall",
  description: "Check or toggle missed call auto-reply",
  category: "utility",

  async execute(sock, chatId, userMessage, sender) {
    try {
      const cleanSender = normalizeJid(sender);
      const args = userMessage.trim().split(" ");

      // Toggle ON/OFF
      if (args[1] === "on" || args[1] === "off") {
        if (!owners.includes(cleanSender)) {
          await sock.sendMessage(chatId, { text: "❌ Only the bot owner can toggle missed call auto-reply." });
          return;
        }

        autoReplyEnabled = args[1] === "on";
        await sock.sendMessage(chatId, { text: `📵 Missed call auto-reply has been *${autoReplyEnabled ? "ENABLED ✅" : "DISABLED ❌"}*.` });
        return;
      }

      // Show last missed call
      if (!lastMissedCall) {
        await sock.sendMessage(chatId, { text: "📞 No missed calls recorded yet." });
        return;
      }

      const { from, callType, time } = lastMissedCall;
      const msg = `📵 *Missed Call Alert* 📵\n\n👤 From: ${from}\n📱 Type: ${callType}\n🕒 Time: ${moment(time).format("DD/MM/YYYY - HH:mm:ss")}`;
      await sock.sendMessage(chatId, { text: msg });
    } catch (err) {
      console.error("MissedCall command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch missed call details." });
    }
  },

  updateMissedCall: async (sock, info) => {
    lastMissedCall = info;

    if (!autoReplyEnabled) return; // Do nothing if auto-reply is OFF

    try {
      const videoPath = path.join(__dirname, "../assets/phone.mp4");

      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);

        await sock.sendMessage(info.from, {
          video: videoBuffer,
          gifPlayback: true,
          caption: "☎️ *MISSEDCALL NOTIFIER*:\nYour call was received but the owner is currently unavailable. Please wait until they get back to you."
        });
      } else {
        await sock.sendMessage(info.from, {
          text: "☎️ *MISSEDCALL NOTIFIER*:\nYour call was received but the owner is currently unavailable. Please wait until they get back to you."
        });
      }
    } catch (err) {
      console.error("Auto reply (missed call) error:", err);
    }
  },

  getStatus: () => autoReplyEnabled
};

