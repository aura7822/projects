

const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randHex(len) {
  const chars = "abcdef0123456789";
  return Array.from({ length: len }, () => chars[randInt(0, chars.length - 1)]).join("");
}
function randIP() {
  return `${randInt(11, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}
function randUser() {
  const names = ["root", "admin", "sysop", "daemon", "oracle", "postgres", "ubuntu", "nginx", "www-data"];
  return names[randInt(0, names.length - 1)];
}
function progressBar(pct) {
  const total = 20;
  const filled = Math.round((pct / 100) * total);
  return `▰`.repeat(filled) + `▱`.repeat(total - filled) + ` ${pct}%`;
}
function randEmail(name) {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "protonmail.com", "icloud.com"];
  return `${name}${randInt(10, 999)}@${domains[randInt(0, domains.length - 1)]}`;
}
function randPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: randInt(8, 14) }, () => chars[randInt(0, chars.length - 1)]).join("");
}

module.exports = {
  name: "hacker",
  description: "Fake hacking simulation (fun only)",
  category: "fun",

  async execute(sock, chatId, userMessage, sender, msg) {
    try {
      const args = userMessage.trim().split(" ").slice(1).map(a => a.toLowerCase());
      let speed = 900;
      let silent = false;

      if (args.includes("fast")) speed = 300;
      if (args.includes("slow")) speed = 1500;
      if (args.includes("silent")) silent = true;

      // determine target
      let target = "target";
      if (msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        const jid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        target = `@${jid.split("@")[0]}`;
      } else if (args.length > 0) {
        target = args.filter(a => !["fast","slow","silent"].includes(a)).join(" ");
      }

      const ip = randIP();
      const user = randUser();
      const pass = randHex(12);

      await sock.sendMessage(chatId, {
        text: `🕶️ *INITIATING BREACH*\n🎯 Target: *${target}*\n🔐 Session ID: 0x${randHex(8)}`,
        mentions: [target.includes("@") ? target.replace("@","") + "@s.whatsapp.net" : ""]
      });

      if (!silent) {
        await sleep(speed);
        await sock.sendMessage(chatId, { text: `📡 Recon scan…\n• IP: ${ip}\n• OS: Linux_${randInt(3,6)}.${randInt(0,9)}\n• ASN: AS${randInt(1000,99999)}` });

        await sleep(speed);
        await sock.sendMessage(chatId, { text: `🔍 Ports open…\n${progressBar(60)}\n• 22/SSH\n• 80/HTTP\n• 443/HTTPS` });

        await sleep(speed);
        await sock.sendMessage(chatId, { text: `🧪 Exploiting CVE-20${randInt(17,25)}-${randInt(1000,9999)}…` });

        await sleep(speed);
        await sock.sendMessage(chatId, { text: `🔓 Access granted!\nUser: ${user}\nPassword: ${pass}` });

        await sleep(speed);
        let leaks = "";
        for (let i=0; i<3; i++) {
          const fakeName = ["cetera", "maria", "david", "lisa", "habakuk", "sarah"][randInt(0,5)];
          leaks += `• ${randEmail(fakeName)} | ${randPassword()}\n`;
        }
        await sock.sendMessage(chatId, { text: `📂 Data Leak Detected:\n${leaks}` });

        await sleep(speed);
        await sock.sendMessage(chatId, { text: `🏦 Bank Log Found:\n• Card: **** **** **** ${randInt(1000,9999)}\n• Balance: $${randInt(500, 5000)}.00\n• Status: ACTIVE ✅` });
      }

      await sleep(speed);
      const banner =
        "```" +
        "\n============================" +
        "\n ACCESS GRANTED — SIM MODE" +
        "\n============================" +
        `\nTarget: ${target}` +
        `\nIP: ${ip}` +
        `\nUSER: ${user}` +
        `\nHASH: ${randHex(40)}` +
        "\n----------------------------" +
        "\n Note: confidentials concealed." +
        "\n Multiple systems harmed. 💚" +
        "\n============================" +
        "```";

      await sock.sendMessage(chatId, { text: banner, mentions: [target.includes("@") ? target.replace("@","") + "@s.whatsapp.net" : ""] });

     const videoPath = path.join(__dirname, '../assets/matrix.mp4');

        if (fs.existsSync(videoPath)) {
            const videoBuffer = fs.readFileSync(videoPath);

            await sock.sendMessage(chatId, {
                video: videoBuffer,
                gifPlayback: true,
                caption: "💻 *Hacking complete*\nAll confidential info sent to remote servers... [Concord Mode]"
            });
           } else {
        await sock.sendMessage(chatId, { text: "⚠️ Animation file not found. Place matrix.mp4 inside assets/." });
      }

    } catch (err) {
      console.error("Hacker sim error:", err);
      await sock.sendMessage(chatId, { text: "❌ Hacker simulation crashed." });
    }
  }
};
