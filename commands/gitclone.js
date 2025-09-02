// commands/gitclone.js
// commands/gitclone.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "gitclone",
  description: "Clone a GitHub repo as a ZIP file",
  category: "utility",

  async execute(sock, chatId, userMessage) {
    try {
      const args = userMessage.split(" ").slice(1);
      if (!args.length) {
        return await sock.sendMessage(chatId, {
          text: "❌ Usage: `.gitclone <github_repo_url>`\nExample: `.gitclone https://github.com/openai/gym`"
        });
      }

      let repoUrl = args[0];
      if (!repoUrl.includes("github.com")) {
        return await sock.sendMessage(chatId, { text: "❌ Please provide a valid GitHub repository URL." });
      }

      // Extract user and repo name
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?/);
      if (!match) {
        return await sock.sendMessage(chatId, { text: "❌ Invalid GitHub repo format." });
      }

      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "");
      const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;

      // Download repo zip
      const res = await fetch(zipUrl);
      if (!res.ok) throw new Error("Failed to fetch repo ZIP");

      const buffer = await res.buffer();
      const filePath = path.join(__dirname, `../${repo}.zip`);
      fs.writeFileSync(filePath, buffer);

      // Send file
      await sock.sendMessage(chatId, {
        document: fs.readFileSync(filePath),
        mimetype: "application/zip",
        fileName: `${repo}.zip`
      });

      fs.unlinkSync(filePath); // cleanup
    } catch (err) {
      console.error("Gitclone error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to clone repository." });
    }
  }
};
