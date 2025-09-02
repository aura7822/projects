const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    try{
        
    const helpMessage = `
╔ ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨✨
🂒
🂒   ════⦗ H E  L  L  O    W  O  R  L D ⦘════
🂒
🂒     *🖥️ ${settings.botName || 'IM AURA '} *
🂒      Version: *${settings.version || '2.0.2'}*
🂒      by ${settings.botOwner || 'AURA '}
🂒      GITHUB : ${global.ytch}
🂒      PLUGINS : 110
🂒      📶Status: 🟢 SYSTEMS NOMINAL
🂒      🚀SPEED : 437.77 ms ⚡
🂒      🕟RESPONSE TIME: 0.00025ms
🂒      RAM: [🟩🟩🟩🟩⬜⬜] 67%
🂒      🖥️Host: Linux Workstation 7 | Kernel 6.9
🂒
╚ ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨✨

                  **~im your favourite psychopath~**

           ===============================
           ❇ powered by Concord-Megatrends ❇
           ===============================

                        *Prompt like a boss :*

▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
📡 *Power commands*:
▧ ➤ .standby
▧ ➤ .restart
▧ ➤ .hibernate
▧ ➤ .server*
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▧
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🌍 *Global Commands*:
▧ ➤ .help or .menu
▧ ➤ .ping
▧ ➤ .alive
▧ ➤ .tts <text>
▧ ➤ .owner
▧ ➤ .joke
▧ ➤ .quote
▧ ➤ .fact
▧ ➤ .weather <city>
▧ ➤ .news
▧ ➤ .attp <text>
▧ ➤ .lyrics <song_title>
▧ ➤ .8ball <question>
▧ ➤ .groupinfo
▧ ➤ .staff or .admins
▧ ➤ .vv
▧ ➤ .time
▧ ➤ .trt <text> <lang>
▧ ➤ .ss <link>
▧ ➤ .jid
▧▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🤵🏽 *Admin Commands*:
▧ ➤ .ban @user
▧ ➤ .promote @user
▧ ➤ .demote @user
▧ ➤ .mute <minutes>
▧ ➤ .unmute
▧ ➤ .delete or .del
▧ ➤ .kick @user
▧ ➤ .warnings @user
▧ ➤ .warn @user
▧ ➤ .antilink
▧ ➤ .antibadword
▧ ➤ .clear
▧ ➤ .tag <message>
▧ ➤ .tagall
▧ ➤ .chatbot
▧ ➤ .resetlink
▧ ➤ .welcome <on/off>
▧ ➤ .goodbye <on/off>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
⚙️ *SUDO Commands*:
▧ ➤ .mode
▧ ➤ .autostatus
▧ ➤ .clearsession
▧ ➤ .anticall
▧ ➤ .missedcall
▧ ➤ .antidelete
▧ ➤ .cleartmp
▧ ➤ .setpp <reply to image>
▧ ➤ .autoreact
▧ ➤ .autotyping <on/off>
▧ ➤ .autoread <on/off>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
📷 *Image Commands*:
▧ ➤ .blur <image>
▧ ➤ .simage <reply to sticker>
▧ ➤ .sticker <reply to image>
▧ ➤ .tgsticker <Link>
▧ ➤ .meme
▧ ➤ .take <packname>
▧ ➤ .emojimix <emj1>+<emj2>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🗿 *Composite Commands*:
▧ ➤ .shelby
▧ ➤ .dictionary
▧ ➤ .verse
▧ ➤ .quran
▧ ➤ .radio
▧ ➤ .liedetector
▧ ➤ .qr<text/link>
▧ ➤ .vcf
▧ ➤ .stoic
▧ ➤ .developernews
▧ ➤ .receipe
▧ ➤ .book<book_title>
▧ ➤ .zodiac
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
            ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🕹️ *Game Commands*:
▧ ➤ .tictactoe @user
▧ ➤ .hangman
▧ ➤ .guess <letter>
▧ ➤ .trivia
▧ ➤ .answer <answer>
▧ ➤ .truth
▧ ➤ .dare
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🤖 *AI Commands*:
▧ ➤ .gpt <question>
▧ ➤ .gemini <question>
▧ ➤ .imagine <prompt>
▧ ➤ .flux <prompt>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🎲 *Fun Commands*:
▧ ➤ .matrix
▧ ➤ .compliment @user
▧ ➤ .insult @user
▧ ➤ .flirt
▧ ➤ .shayari
▧ ➤ .goodnight
▧ ➤ .roseday
▧ ➤ .character @user
▧ ➤ .wasted @user
▧ ➤ .ship @user
▧ ➤ .simp @user
▧ ➤ .stupid @user [text]
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🔡 *Textmanipulator*:
▧ ➤ .metallic <text>
▧ ➤ .ice <text>
▧ ➤ .snow <text>
▧ ➤ .impressive <text>
▧ ➤ .matrix <text>
▧ ➤ .light <text>
▧ ➤ .neon <text>
▧ ➤ .devil <text>
▧ ➤ .purple <text>
▧ ➤ .thunder <text>
▧ ➤ .leaves <text>
▧ ➤ .1917 <text>
▧ ➤ .arena <text>
▧ ➤ .hacker <text>
▧ ➤ .sand <text>
▧ ➤ .blackpink <text>
▧ ➤ .glitch <text>
▧ ➤ .fire <text>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
📥 *Downloader*:
▧ ➤ .song <song_name>
▧ ➤ .instagram <link>
▧ ➤ .facebook <link>
▧ ➤ .tiktok <link>
▧ ➤ .play <song_name>
▧ ➤ .video <video name>
▧ ➤ .ytmp4 <Link>
▧ ➤ .sportify <song_name>
▧ ➤ .anime <anime name>
▧ ➤ .movie <movie name>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
           ▨
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
💻 *Github Commands:*
▧ ➤ .git
▧ ➤ .gitclone<repo_url>
▧ ➤ .github
▧ ➤ .sc
▧ ➤ .script
▧ ➤ .repo
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
══════════════════════
▧ ➤ .helpdesk         
══════════════════════
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️
🞼Follow me on github for updates
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨❄️


⏳ This menu will self-destruct in *200 seconds*.


`;

   const imagePath = path.join(__dirname, '../assets/cover.mp4');
        let sentMsg;

        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);

            sentMsg = await sock.sendMessage(chatId, {
                video: imageBuffer,
                gifPlayback: true,
                caption: helpMessage,
                footer: "✨ Choose an option below ✨",
                buttons: [
                    { buttonId: ".owner", buttonText: { displayText: "👤 View Owner" }, type: 1 },
                    { buttonId: ".menu", buttonText: { displayText: "📜 Full Menu" }, type: 1 },
                    { buttonId: ".ping", buttonText: { displayText: "⚡ Ping Bot" }, type: 1 }
                ],
                headerType: 5
            }, { quoted: message });
        } else {
            sentMsg = await sock.sendMessage(chatId, {
                text: helpMessage,
                footer: "✨ Choose an option below ✨",
                buttons: [
                    { buttonId: ".owner", buttonText: { displayText: "👤 View Owner" }, type: 1 },
                    { buttonId: ".menu", buttonText: { displayText: "📜 Full Menu" }, type: 1 },
                    { buttonId: ".ping", buttonText: { displayText: "⚡ Ping Bot" }, type: 1 }
                ],
                headerType: 1
            }, { quoted: message });
        }

        // 🔥 Auto-delete after 200 seconds
        if (sentMsg?.key) {
            setTimeout(async () => {
                try {
                    await sock.sendMessage(chatId, {
                        delete: sentMsg.key
                    });
                } catch (err) {
                    console.error("Error auto-deleting .help message:", err);
                }
            }, 200 * 1000); // 200 seconds
        }

    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to load help menu.' });
    }
}

module.exports = helpCommand;