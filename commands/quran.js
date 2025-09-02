// commands/quran.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
  name: 'quran',
  description: 'Sends a random or specific Quran verse with an image',
  execute: async (sock, chatId, userMessage) => {
    try {
      // Extract optional reference, e.g., ".quran 2:255"
      const ref = userMessage.slice(6).trim(); // removes ".quran "
      let endpoint;

      if (ref) {
        // Specific verse by reference
        endpoint = `http://api.alquran.cloud/v1/ayah/${encodeURIComponent(ref)}/en.asad`;
      } else {
        // Random verse: pick from a preset list of surah:ayah
        const randomList = ["2:255", "67:1", "112:1", "1:1", "36:32"];
        const randomRef = randomList[Math.floor(Math.random() * randomList.length)];
        endpoint = `http://api.alquran.cloud/v1/ayah/${randomRef}/en.asad`;
      }

      const response = await axios.get(endpoint);

      if (!response.data || response.data.status !== 'OK' || !response.data.data) {
        await sock.sendMessage(chatId, { text: '⚠️ Verse not found. Try `.quran 2:255`' });
        return;
      }

      const verse = response.data.data;
      const verseMsg = `📖 *Quran Verse*\n_${verse.surah.number}:${verse.numberInSurah} ${verse.surah.englishName}_\n"${verse.text.trim()}"\n– Translation: ${verse.edition.englishName}`;

      // Load fixed image from assets (place it here)
      const imagePath = path.join(__dirname, '../assets/quran.jpeg');
      let buffer;
      try {
        buffer = fs.readFileSync(imagePath);
      } catch {
        buffer = null;
      }

      if (buffer) {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: verseMsg
        });
      } else {
        await sock.sendMessage(chatId, { text: verseMsg });
      }
    } catch (err) {
      console.error('❌ Error fetching Quran verse:', err.message);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch verse. Please try again later.' });
    }
  }
};
