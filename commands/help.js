const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    try{
        
    const helpMessage = `
✞ ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨✨
❖ 
❖  ════⦗ H E  L  L  O    W  O  R  L D ⦘════
❖
❖     *🖥️ ${settings.botName || 'aurora® '} *
❖      Version: *${settings.version || '2.0.5'}*
❖      by ${settings.botOwner || 'aura '}
❖      GITHUB : ${global.ytch}
❖      📸Instagram : _t.y.p.i.c.a.l.l.y_aura_73
❖      PLUGINS : 110
❖      📶Status: 🟢 SYSTEMS NOMINAL
❖      🚀SPEED : 437.77 ms ⚡
❖      🕟RESPONSE TIME: 0.00025ms
❖      RAM: [🟩🟩🟩🟩⬜⬜] 67%
❖      🖥️Host: Linux Workstation 7 | Kernel 6.9
❖
✞ ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨✨

                  **~Bullets dont negotiate**

           ===============================
              🦋 powered by CIGMA™🦋
           ===============================


🐾Parental advisory : Fragile software [21+]
🐾Revise our terms of service...


           *aura@fedora:~$ sudo sysytemctl start aura.service*
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
📡 *Power commands*:
❖ ➤ .standby
❖ ➤ .restart
❖ ➤ .hibernate
❖ ➤ .server 🛈
❖ ➤ .portfolio
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🌍 *Global Commands*:

❖ ➤ .help or .menu
❖ ➤ .ping
❖ ➤ .alive
❖ ➤ .tts <text>
❖ ➤ .owner
❖ ➤ .joke
❖ ➤ .quote
❖ ➤ .fact
❖ ➤ .weather <city>
❖ ➤ .news
❖ ➤ .attp <text>
❖ ➤ .lyrics <song_title>
❖ ➤ .8ball <question>
❖ ➤ .groupinfo
❖ ➤ .staff or .admins
❖ ➤ .vv
❖ ➤ .time
❖ ➤ .trt <text> <lang>
❖ ➤ .ss <link>
❖ ➤ .jid
▧▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🤵🏽 *Admin Commands*:

❖ ➤ .ban @user
❖ ➤ .promote @user
❖ ➤ .demote @user
❖ ➤ .mute <minutes>
❖ ➤ .unmute
❖ ➤ .delete or .del
❖ ➤ .kick @user
❖ ➤ .warnings @user
❖ ➤ .warn @user
❖ ➤ .antilink
❖ ➤ .antibadword
❖ ➤ .clear
❖ ➤ .tag <message>
❖ ➤ .tagall
❖ ➤ .chatbot
❖ ➤ .resetlink
❖ ➤ .welcome <on/off>
❖ ➤ .goodbye <on/off>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
⚙️ *SUDO Commands*:

❖ ➤ .mode
❖ ➤ .autostatus
❖ ➤ .clearsession
❖ ➤ .anticall
❖ ➤ .missedcall
❖ ➤ .antidelete
❖ ➤ .cleartmp
❖ ➤ .setpp <reply to image>
❖ ➤ .autoreact
❖ ➤ .autotyping <on/off>
❖ ➤ .autoread <on/off>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
📷 *Image Commands*:

❖ ➤ .blur <image>
❖ ➤ .simage <reply to sticker>
❖ ➤ .sticker <reply to image>
❖ ➤ .tgsticker <Link>
❖ ➤ .meme
❖ ➤ .take <packname>
❖ ➤ .emojimix <emj1>+<emj2>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🗿 *Composite Commands*:

❖ ➤ .shelby
❖ ➤ .dictionary
❖ ➤ .verse
❖ ➤ .quran
❖ ➤ .radio
❖ ➤ .liedetector
❖ ➤ .qr<text/link>
❖ ➤ .vcf
❖ ➤ .stoic
❖ ➤ .developernews
❖ ➤ .receipe
❖ ➤ .book<book_title>
❖ ➤ .zodiac
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🃏 *Game Commands*:

❖ ➤ .tictactoe @user
❖ ➤ .hangman
❖ ➤ .guess <letter>
❖ ➤ .trivia
❖ ➤ .answer <answer>
❖ ➤ .truth
❖ ➤ .dare
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🝆
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🌇 *Pies Commands*:

❖ ➤ .pies ,country.
❖ ➤ .japan
❖ ➤ .china
❖ ➤ .indonesia
❖ ➤ .korea
❖ ➤ .hijab
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🤖 *AI Commands*:

❖ ➤ .gpt <question>
❖ ➤ .gemini <question>
❖ ➤ .imagine <prompt>
❖ ➤ .flux <prompt>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🎲 *Fun Commands*:

❖ ➤ .matrix
❖ ➤ .compliment @user
❖ ➤ .insult @user
❖ ➤ .flirt
❖ ➤ .shayari
❖ ➤ .goodnight
❖ ➤ .roseday
❖ ➤ .character @user
❖ ➤ .wasted @user
❖ ➤ .ship @user
❖ ➤ .simp @user
❖ ➤ .stupid @user [text]
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🌞*MISC*:

❖ ➤ .triggered
❖ ➤ .passed
❖ ➤ .jail
❖ ➤ .glass
❖ ➤ .gay
❖ ➤ .comrade
❖ ➤ .ytcomment
❖ ➤ .tweet
❖ ➤ .oogway
❖ ➤ .namecard
❖ ➤ .its-so-stupid
❖ ➤ .lolice
❖ ➤ .lgbt
❖ ➤ .circle
❖ ➤ .horny
❖ ➤ .heart
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🔡 *Textmanipulator*:

❖ ➤ .metallic <text>
❖ ➤ .ice <text>
❖ ➤ .snow <text>
❖ ➤ .impressive <text>
❖ ➤ .matrix <text>
❖ ➤ .light <text>
❖ ➤ .neon <text>
❖ ➤ .devil <text>
❖ ➤ .purple <text>
❖ ➤ .thunder <text>
❖ ➤ .leaves <text>
❖ ➤ .1917 <text>
❖ ➤ .arena <text>
❖ ➤ .hacker <text>
❖ ➤ .sand <text>
❖ ➤ .blackpink <text>
❖ ➤ .glitch <text>
❖ ➤ .fire <text>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
🍄*Anime*:

❖ ➤ .pat
❖ ➤ .kiss
❖ ➤ .hug
❖ ➤ .cry
❖ ➤ .wink
❖ ➤ .poke
❖ ➤ .facepalm
❖ ➤ .nom
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
📥 *Downloader*:

❖ ➤ .song <song_name>
❖ ➤ .instagram <link>
❖ ➤ .facebook <link>
❖ ➤ .tiktok <link>
❖ ➤ .play <song_name>
❖ ➤ .video <video name>
❖ ➤ .ytmp4 <Link>
❖ ➤ .sportify <song_name>
❖ ➤ .anime <anime name>
❖ ➤ .movie <movie name>
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
___________________________________________
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
💻 *Github Commands:*

❖ ➤ .git
❖ ➤ .gitclone<repo_url>
❖ ➤ .github
❖ ➤ .sc
❖ ➤ .script
❖ ➤ .repo
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
══════════════════════
▧ ➤ .helpdesk 


Fragile software [21+]
Use responsibly to escape bans

══════════════════════
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾
aurora® © 2024-2026 restricted to Ages [21+]
▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨🐾


⏳Press esc or This menu will self-kill in *200 seconds*.


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