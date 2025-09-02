const axios = require("axios");

module.exports = {
  name: "anime",
  description: "Search for anime details + streaming links",
  execute: async (sock, chatId, userMessage) => {
    try {
      const query = userMessage.split(" ").slice(1).join(" ").trim();
      if (!query) {
        await sock.sendMessage(chatId, { text: "⚠️ Please type an anime name. Example: `.anime one piece`" });
        return;
      }

      await sock.sendMessage(chatId, { text: `🔎 Searching anime: *${query}* ...` });

      // AniList API
      const url = "https://graphql.anilist.co";
      const response = await axios.post(url, {
        query: `
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description(asHtml: false)
              episodes
              genres
              startDate {
                year
              }
              coverImage {
                large
              }
            }
          }
        `,
        variables: { search: query }
      });

      const anime = response.data.data.Media;

      if (!anime) {
        await sock.sendMessage(chatId, { text: `❌ No results found for: *${query}*` });
        return;
      }

      const title = anime.title.english || anime.title.romaji || anime.title.native || "Unknown Title";
      const description = anime.description ? anime.description.replace(/<[^>]+>/g, "").substring(0, 500) + "..." : "No description available.";
      const genres = anime.genres?.length ? anime.genres.join(", ") : "N/A";
      const episodes = anime.episodes || "?";
      const year = anime.startDate?.year || "Unknown";

      // Try to fetch streaming links from gogoanime API
      let streamLinks = "";
      try {
        const gogoUrl = `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(title)}`;
        const gogoRes = await axios.get(gogoUrl);
        if (gogoRes.data && gogoRes.data.results && gogoRes.data.results.length > 0) {
          const bestMatch = gogoRes.data.results[0];
          streamLinks = `▶️ [Watch Online](${bestMatch.url})\n📥 [Download](${bestMatch.url})`;
        } else {
          streamLinks = "⚠️ Streaming/Download links not found.";
        }
      } catch (e) {
        streamLinks = "⚠️ Failed to fetch streaming links.";
      }

      const message = `🎌 *${title}*\n\n📖 ${description}\n\n📅 Released: ${year}\n🎭 Genres: ${genres}\n🔗 Episodes: ${episodes}\n\n${streamLinks}`;

      if (anime.coverImage?.large) {
        await sock.sendMessage(chatId, {
          image: { url: anime.coverImage.large },
          caption: message
        });
      } else {
        await sock.sendMessage(chatId, { text: message });
      }

    } catch (err) {
      console.error("Error in .anime:", err);
      await sock.sendMessage(chatId, { text: `⚠️ Error in .anime: ${err.message}` });
    }
  }
};
