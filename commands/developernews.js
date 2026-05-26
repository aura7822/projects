// commands/hackernews.js
const axios = require("axios");
const fetch = require('node-fetch');

module.exports = {
  name: "developernews",
  description: "Fetches the latest Hacker News top stories",
  execute: async (sock, chatId) => {
    try {
      await sock.sendMessage(chatId, { text: "📰 Fetching latest Developer News..." });

      // Fetch top story IDs
      const topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
      const { data: storyIds } = await axios.get(topStoriesUrl);

      // Get top 5 stories
      const topFive = storyIds.slice(0, 5);

      let newsText = "📡 *Top Developer News Stories:*\n\n";

      for (let id of topFive) {
        const storyUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const { data: story } = await axios.get(storyUrl);

        if (story && story.title && story.url) {
          newsText += `🔹 *${story.title}*\n🌐 ${story.url}\n\n`;
        }
      }

      await sock.sendMessage(chatId, { text: newsText.trim() });
    } catch (error) {
      console.error("Error fetching Developer News:", error);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch Developer News. Try again later." });
    }
  },
};
