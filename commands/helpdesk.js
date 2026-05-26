const axios = require('axios');

// commands/helpdesk.js
module.exports = {
  name: "helpdesk",
  description: "Get support contact details",
  category: "system",

  async execute(sock, chatId) {
    try {
      const msg = `📡 *HELPDESK - SUPPORT CENTER*\n
⚡ Please reach out for any technical issues, bug reports, or assistance.\n\n
☎️ Primary Support: wa.me/254785345947  
☎️ Secondary Support: wa.me/254113334497  
📧 Email: mailto:joshuaura7822@gmail.com`;

      await sock.sendMessage(chatId, { text: msg });
    } catch (err) {
      console.error("Helpdesk command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to open Helpdesk menu." });
    }
  }
};
