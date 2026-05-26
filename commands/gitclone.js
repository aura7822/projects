// commands/gitclone.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

module.exports = {
  name: "gitclone",
  description: "Clone a GitHub repo as a ZIP file",
  category: "utility",
  usage: ".gitclone <github_repo_url> [branch]",
  example: ".gitclone https://github.com/openai/gym main",

  async execute(sock, chatId, userMessage, message) {
    const startTime = performance.now();

    try {
      const args = userMessage.trim().split(/\s+/).slice(1);

      // HELP MENU
      if (!args.length) {
        const helpText = `📦 *GITCLONE COMMAND*
━━━━━━━━━━━━━━━━━━━━━

📋 *Description*
Clone any public GitHub repository as a ZIP file

🔰 *Usage*
• \`.gitclone <url>\`
• \`.gitclone <url> <branch>\`

📌 *Examples*
• \`.gitclone https://github.com/expressjs/express\`
• \`.gitclone https://github.com/nodejs/node main\`
• \`.gitclone https://github.com/torvalds/linux master\`

⚠️ Only public repositories are supported.
━━━━━━━━━━━━━━━━━━━━━`;

        return await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
      }

      let repoUrl = args[0];
      let branch = args[1] || "main";

      if (!repoUrl.includes("github.com")) {
        return await sock.sendMessage(chatId, {
          text: "❌ Invalid GitHub URL.\nExample: https://github.com/user/repo"
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, {
        text: "🔍 Processing repository...\nPlease wait..."
      }, { quoted: message });

      // Extract repo info
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/i);
      if (!match) {
        return await sock.sendMessage(chatId, {
          text: "❌ Could not parse repository URL."
        }, { quoted: message });
      }

      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "");

      // Try GitHub API
      try {
        const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (apiRes.ok) {
          const info = await apiRes.json();

          await sock.sendMessage(chatId, {
            text:
`📁 *Repository Found*
━━━━━━━━━━━━━━━━━━━━━
📌 Name: ${info.full_name}
⭐ Stars: ${info.stargazers_count}
🍴 Forks: ${info.forks_count}
📅 Updated: ${new Date(info.updated_at).toLocaleDateString()}

⬇️ Downloading...`
          }, { quoted: message });

          branch = args[1] || info.default_branch;
        }
      } catch (e) {
        console.log("GitHub API unavailable, continuing...");
      }

      // Detect working branch
      const branches = [branch, "main", "master"];
      let zipUrl = null;
      let usedBranch = null;

      for (const b of branches) {
        const testUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${b}`;
        const test = await fetch(testUrl, { method: "HEAD" }).catch(() => null);
        if (test && test.ok) {
          zipUrl = testUrl;
          usedBranch = b;
          break;
        }
      }

      if (!zipUrl) {
        return await sock.sendMessage(chatId, {
          text: "❌ Could not locate a valid branch."
        }, { quoted: message });
      }

      const res = await fetch(zipUrl);
      if (!res.ok) throw new Error("Download failed");

      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const filePath = path.join(tempDir, `${repo}-${Date.now()}.zip`);
      const fileStream = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
      });

      const stats = fs.statSync(filePath);
      const time = ((performance.now() - startTime) / 1000).toFixed(1);

      await sock.sendMessage(chatId, {
        document: fs.readFileSync(filePath),
        mimetype: "application/zip",
        fileName: `${repo}-${usedBranch}.zip`,
        caption:
`📦 *Repository Downloaded*
━━━━━━━━━━━━━━━━━━━━━
📁 Repo: ${owner}/${repo}
🌿 Branch: ${usedBranch}
📊 Size: ${formatBytes(stats.size)}
⏱ Time: ${time}s
━━━━━━━━━━━━━━━━━━━━━
✅ Completed`
      }, { quoted: message });

      fs.unlinkSync(filePath);

      cleanupOldFiles(tempDir, 60 * 60 * 1000);

    } catch (err) {
      console.error("Gitclone error:", err);

      await sock.sendMessage(chatId, {
        text:
`❌ *Gitclone Failed*
━━━━━━━━━━━━━━━━━━━━━
Possible reasons:
• Repository is private
• Repo does not exist
• Network error
• GitHub rate limit`
      }, { quoted: message });
    }
  }
};


// Format file size
function formatBytes(bytes) {
  if (!bytes) return "0 Bytes";
  const sizes = ["Bytes","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes)/Math.log(1024));
  return (bytes/Math.pow(1024,i)).toFixed(2)+" "+sizes[i];
}


// Delete old temp files
function cleanupOldFiles(dir, maxAge) {
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();

    files.forEach(file=>{
      const fp = path.join(dir,file);
      const stat = fs.statSync(fp);
      if(now - stat.mtimeMs > maxAge){
        fs.unlinkSync(fp);
      }
    });
  } catch(e){}
}