// commands/radio.js
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// commands/radio.js
module.exports = {
  name: "radio",
  description: "Access Kenyan radio stations",
  category: "entertainment",

  async execute(sock, chatId, userMessage) {
    const stations = {
      kiss: {
        name: "Kiss 100 FM",
        site: "https://kiss100.co.ke"
      },
      classic: {
        name: "Classic 105 FM",
        site: "https://classic105.com"
      },
      jambo: {
        name: "Radio Jambo",
        site: "https://www.radiokenya.net/radiojambo"
      }
    };

    const key = userMessage.trim().split(" ")[1]?.toLowerCase();

    if (!key || !stations[key]) {
      let list = "📻 *Available Kenyan Stations:*\n";
      for (const s in stations) {
        list += `• ${stations[s].name} — \`.radio ${s}\`\n`;
      }
      await sock.sendMessage(chatId, { text: list });
      return;
    }

    const station = stations[key];
    await sock.sendMessage(chatId, {
      text: `You can listen to *${station.name}* via their official site:\n${station.site}`
    });
  }
};
