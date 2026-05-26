const yts = require('yt-search');
const axios = require('axios');

/**
 * Enhanced YouTube Audio Downloader
 * Shows video info before sending audio
 */
async function playCommand(sock, chatId, message) {
    try {
        // Extract the query from the message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, { text: "❌ *Please provide a song name!*" });
        }

        // Search YouTube
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { text: "❌ *No results found for your query!*" });
        }

        const video = videos[0];
        const urlYt = video.url;

        // Show video info before downloading
        const infoMessage = `
🎵 *${video.title}*
⏱️ Duration: ${video.timestamp}
👁️ Views: ${video.views.toLocaleString()}
📌 Uploaded: ${video.ago}
🔗 Link: ${urlYt}

_Starting download..._ ⬇️
        `;

        if (video.image) {
            await sock.sendMessage(chatId, {
                image: { url: video.image },
                caption: infoMessage,
            });
        } else {
            await sock.sendMessage(chatId, { text: infoMessage });
        }

        // Fetch audio URL from API
        const apiResponse = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(urlYt)}`);
        const data = apiResponse.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            return await sock.sendMessage(chatId, { text: "❌ Failed to fetch audio. Please try again later." });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title.replace(/[*?<>|]/g, ''); // sanitize filename

        // Send audio with quoted message for context
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: message });

        // Optional: confirmation
        await sock.sendMessage(chatId, { text: `✅ *${title}* has been sent successfully!` });

    } catch (err) {
        console.error('❌ Error in playCommand:', err);
        await sock.sendMessage(chatId, { text: "❌ Download failed. Please try again later." });
    }
}

module.exports = playCommand;