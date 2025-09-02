// commands/vcf.js
const fs = require("fs");
const axios = require('axios');
module.exports = {
  name: "vcf",
  description: "Sends one or more vCard contacts (.vcf)",
  execute: async (sock, chatId, userMessage, msg) => {
    try {
      // Case 1: user replies to a message with ".vcf"
      let args = userMessage.slice(5).trim();
      if (!args && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const text = quoted.conversation || quoted.extendedTextMessage?.text || "";
        args = text.trim();
      }

      if (!args) {
        await sock.sendMessage(chatId, { text: "❌ Usage: .vcf <name> <number>,eg .vcf Robo +254113334497 ...\nOr reply to a message containing a number with .vcf" });
        return;
      }

      // Split by comma for multiple contacts
      const contactsArray = args.split(",").map(c => c.trim());
      const vcardContacts = [];

      for (let contact of contactsArray) {
        const parts = contact.split(/\s+/); // split by spaces
        if (parts.length < 2) {
          // if only number provided (e.g. reply), assign default name
          const numberOnly = parts[0]?.replace(/[^0-9]/g, "");
          if (numberOnly) {
            const vcard =
              "BEGIN:VCARD\n" +
              "VERSION:3.0\n" +
              `FN:Contact\n` +
              `TEL;type=CELL;type=VOICE;waid=${numberOnly}:${numberOnly}\n` +
              "END:VCARD";
            vcardContacts.push({ vcard });
          }
          continue;
        }

        const name = parts[0];
        const number = parts[1].replace(/[^0-9]/g, ""); // clean digits

        if (!number) continue;

        const vcard =
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          `FN:${name}\n` +
          `TEL;type=CELL;type=VOICE;waid=${number}:${number}\n` +
          "END:VCARD";

        vcardContacts.push({ vcard });
      }

      if (vcardContacts.length === 0) {
        await sock.sendMessage(chatId, { text: "⚠️ No valid contacts found." });
        return;
      }

      // Send all contacts
      await sock.sendMessage(chatId, {
        contacts: {
          displayName: `📇 ${vcardContacts.length} contact(s)`,
          contacts: vcardContacts,
        },
      });
    } catch (err) {
      console.error("Error in .vcf command:", err);
      await sock.sendMessage(chatId, { text: "⚠️ Failed to send vCard(s)" });
    }
  },
};
