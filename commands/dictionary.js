// commands/dictionary.js
const axios = require('axios');
const fetch = require('node-fetch');

module.exports = {
    name: 'dictionary',
    description: 'Look up the definition, synonyms, and antonyms of a word',
    execute: async (sock, chatId, userMessage) => {
        try {
            // Extract word (e.g., ".dictionary hello")
            const word = userMessage.split(" ")[1];

            if (!word) {
                await sock.sendMessage(chatId, { 
                    text: "📖 Please specify a word.\n\nExample: *.dictionary hello*" 
                });
                return;
            }

            // Fetch data from dictionary API
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = response.data[0];

            let reply = `📖 *Word:* ${word}\n\n`;

            data.meanings.forEach((meaning, index) => {
                const def = meaning.definitions[0].definition;
                const example = meaning.definitions[0].example ? `\n✍️ Example: ${meaning.definitions[0].example}` : "";
                const synonyms = meaning.synonyms && meaning.synonyms.length > 0 ? `\n🔹 Synonyms: ${meaning.synonyms.slice(0, 5).join(", ")}` : "";
                const antonyms = meaning.antonyms && meaning.antonyms.length > 0 ? `\n🔸 Antonyms: ${meaning.antonyms.slice(0, 5).join(", ")}` : "";

                reply += `*${index + 1}. ${meaning.partOfSpeech}*\n👉 ${def}${example}${synonyms}${antonyms}\n\n`;
            });

            await sock.sendMessage(chatId, { text: reply.trim() });

        } catch (error) {
            console.error("❌ Error fetching dictionary definition:", error.message);
            await sock.sendMessage(chatId, { 
                text: "❌ Could not find that word. Please try another." 
            });
        }
    }
};
