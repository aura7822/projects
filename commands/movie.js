// commands/movie.js
const axios = require('axios');
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "movie",
  description: "Fetch details about a movie",
  category: "fun",

  async execute(sock, chatId, userMessage) {
    try {
      const args = userMessage.split(" ").slice(1).join(" ");
      if (!args) {
        await sock.sendMessage(chatId, { text: "🎬 Please provide a movie name.\nExample: `.movie American psycho`" });
        return;
      }

      // Replace with your OMDb API key
      const apiKey = "1af56bff"; 
      const query = encodeURIComponent(args);
      const url = `http://www.omdbapi.com/?t=${query}&apikey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.Response === "False") {
        await sock.sendMessage(chatId, { text: `❌ Movie not found for: "${args}"` });
        return;
      }

      const title = data.Title || "N/A";
      const year = data.Year || "N/A";
      const genre = data.Genre || "N/A";
      const plot = data.Plot || "N/A";
      const rating = data.imdbRating || "N/A";
      const runtime = data.Runtime || "N/A";
      const poster = data.Poster !== "N/A" ? data.Poster : null;

      const message = `🎬 *${title}* (${year})\n\n📌 Genre: ${genre}\n⭐ IMDB: ${rating}/10\n🕒 Runtime: ${runtime}\n\n📝 Plot: ${plot}`;

      if (poster) {
        await sock.sendMessage(chatId, {
          image: { url: poster },
          caption: message
        });
      } else {
        await sock.sendMessage(chatId, { text: message });
      }

    } catch (err) {
      console.error("Movie command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch movie info. Try again later." });
    }
  }
};
