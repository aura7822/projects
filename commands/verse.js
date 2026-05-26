


// commands/verse.js
const axios = require('axios');
const fetch = require('node-fetch');
const fs = require("fs");
const path = require("path");


const API_KEY = "b744311ab61e345ea6cad7d61362c3dd"; // ⬅️ Replace with your real API key
const BIBLE_ID = "de4e12af7f28f599-02"; // KJV (default Bible)

module.exports = {
    name: "verse",
    description: "Sends a random or specific Bible verse with one image",
    execute: async (sock, chatId, userMessage) => {
        try {
            const passage = userMessage.slice(6).trim(); // e.g. ".verse John 3:16"
            let url;

            if (passage) {
                // Specific verse
                url = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/passages/${encodeURIComponent(passage)}`;
            } else {
                // Random verse (preset pool)
                const randomVerses = ["JHN.3.16", "PSA.23.1", "ROM.8.28", "MAT.5.9", "PRO.3.5"];
                const random = randomVerses[Math.floor(Math.random() * randomVerses.length)];
                url = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/passages/${random}`;
            }

            const response = await axios.get(url, {
                headers: { "api-key": API_KEY }
            });

            if (!response.data || !response.data.data) {
                await sock.sendMessage(chatId, { text: "⚠️ Verse not found. Try `.verse John 3:16`" });
                return;
            }

            const verse = response.data.data;
            const verseMsg = `📖 *Bible Verse*  
_${verse.reference}_  
"${verse.content.replace(/<[^>]+>/g, '').trim()}"`;

            // Fixed image (always the same)
            const imagePath = path.join(__dirname, "../assets/verse.jpeg"); // Put verse.jpg in assets/
            const imageBuffer = fs.readFileSync(imagePath);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: verseMsg
            });

        } catch (error) {
            console.error("❌ Error fetching Bible verse you pagan:", error.message);
            await sock.sendMessage(chatId, { text: "❌ Failed to fetch Bible verse. Check API key or try again later." });
        }
    }
};
