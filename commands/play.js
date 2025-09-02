const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "🎶 *What song do you want to download?*\n\nExample: _.play ogame_"
            });
        }

        // Search YouTube
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { text: "❌ *Server currently busy*" });
        }

        // Pick top 1 result
        const video = videos[0];
        const urlYt = video.url;

        // Send video preview before downloading
        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎶 *Now Playing...*\n\n` +
                     `📌 *Title:* ${video.title}\n` +
                     `⏳ *Duration:* ${video.timestamp}\n` +
                     `👀 *Views:* ${video.views.toLocaleString()}\n` +
                     `📤 *Channel:* ${video.author.name}\n\n` +
                     `▶️ _Downloading audio, please wait..._`
        });

        // Fetch audio data from API
        let response;
        try {
            response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`);
        } catch (err) {
            // fallback API
            response = await axios.get(`https://api.neoxr.my.id/api/yta?url=${urlYt}&apikey=freekey`);
        }

        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ *Server busy, please try again later.*"
            });
        }

        const audioUrl = data.result.downloadUrl || data.result.url;
        const title = data.result.title || video.title;

        // Send the audio
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: message });

        // Confirmation message
        await sock.sendMessage(chatId, { text: `✅ *${title}* has been delivered! Enjoy 🎧` });

    } catch (error) {
        console.error('Error in play command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ *Download failed. Contact bot owner.*"
        });
    }
}

module.exports = playCommand;

