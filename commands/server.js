// commands/server.js
const PASSWORD = "concord"; // change this
let authenticatedUsers = new Set();

module.exports = {
  name: "server",
  description: "Access the server console (owner only, password protected)",
  category: "system",

  async execute(sock, chatId, userMessage, sender) {
    try {
      const args = userMessage.trim().split(" ");

      if (args[1] === "login") {
        if (args[2] === PASSWORD) {
          authenticatedUsers.add(sender);
          await sock.sendMessage(chatId, { text: "✅ Authentication successful! You can now use `.server`." });
        } else {
          await sock.sendMessage(chatId, { text: "❌ Incorrect password." });
        }
        return;
      }

      if (!authenticatedUsers.has(sender)) {
        await sock.sendMessage(chatId, { text: "🔒 This command is password protected. Use: `.server login <password>`" });
        return;
      }

      // ✅ Proper clickable URL button
      await sock.sendMessage(chatId, {
        text: "🖥️ Server Console Access",
        footer: "Click the button below to open",
        buttons: [
          {
            buttonId: "open_server",
            buttonText: { displayText: "🌐 Open Console" },
            type: 1
          }
        ],
        headerType: 1
      });

      // Note: WhatsApp only allows text buttons in-app, not real clickable URLs.
      // To work around, send the actual link separately:
      await sock.sendMessage(chatId, {
        text: "🔗 Server Link: https://control.katabump.com/server/f54bf5cd/console"
      });

    } catch (err) {
      console.error("Server command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to execute server command." });
    }
  }
};

