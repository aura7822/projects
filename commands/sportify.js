// commands/spotify.js
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

async function getSpotifyToken(clientId, clientSecret) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) throw new Error("Failed to fetch Spotify token");
  return (await res.json()).access_token;
}

module.exports = {
  name: "spotify",
  description: "Fetch Spotify details (songs, artists, albums, playlists, or links)",
  category: "music",

  async execute(sock, chatId, userMessage) {
    try {
      const query = userMessage.split(" ").slice(1).join(" ");
      if (!query) {
        await sock.sendMessage(chatId, { text: "🎵 Please provide a search query or Spotify link.\nExample: `.spotify Blinding Lights` or `.spotify https://open.spotify.com/track/...`" });
        return;
      }

      const clientId = "c2036ac9f0e84ee6980b4ab016f91633";
      const clientSecret = "d87b7e81eb0a4833938d5fbc6b160c1b";
      const token = await getSpotifyToken(clientId, clientSecret);

      // 📌 Detect if input is a Spotify link
      const linkRegex = /open\.spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/;
      const match = query.match(linkRegex);

      if (match) {
        const type = match[1];
        const id = match[2];
        const res = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Spotify API error with link");
        const item = await res.json();

        switch (type) {
          case "track":
            await sendTrack(sock, chatId, item);
            break;
          case "album":
            await sendAlbum(sock, chatId, item);
            break;
          case "artist":
            await sendArtist(sock, chatId, item);
            break;
          case "playlist":
            await sendPlaylist(sock, chatId, item);
            break;
        }
        return;
      }

      // Otherwise, normal search
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album,playlist&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Spotify API error during search");
      const data = await res.json();

      if (data.tracks.items.length) return await sendTrack(sock, chatId, data.tracks.items[0]);
      if (data.artists.items.length) return await sendArtist(sock, chatId, data.artists.items[0]);
      if (data.albums.items.length) return await sendAlbum(sock, chatId, data.albums.items[0]);
      if (data.playlists.items.length) return await sendPlaylist(sock, chatId, data.playlists.items[0]);

      await sock.sendMessage(chatId, { text: `❌ No results found for: "${query}"` });

    } catch (err) {
      console.error("Spotify command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch Spotify info. Please try again later." });
    }
  }
};

// --- Helpers ---
// --- Helpers ---
async function sendTrack(sock, chatId, track) {
  const title = track.name;
  const artist = track.artists.map(a => a.name).join(", ");
  const album = track.album.name;
  const url = track.external_urls.spotify;
  const preview = track.preview_url;
  const cover = track.album.images.length ? track.album.images[0].url : null;

  const reply = `🎶 *${title}*\n👤 Artist: ${artist}\n💽 Album: ${album}\n🔗 [Open in Spotify](${url})`;

  if (cover) {
    await sock.sendMessage(chatId, { image: { url: cover }, caption: reply });
  } else {
    await sock.sendMessage(chatId, { text: reply });
  }

  if (preview) {
    // ✅ Send Spotify’s preview audio if available
    const audioRes = await fetch(preview);
    const buffer = await audioRes.buffer();
    await sock.sendMessage(chatId, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title} - Preview.mp3`
    });
  } else {
    // ❌ No Spotify preview → fallback to YouTube
    const youtubeKey = "YOUR_YOUTUBE_API_KEY"; // 🔑 Replace with your key
    const query = encodeURIComponent(`${title} ${artist}`);
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${youtubeKey}`
    );

    if (ytRes.ok) {
      const ytData = await ytRes.json();
      if (ytData.items.length > 0) {
        const videoId = ytData.items[0].id.videoId;
        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
        await sock.sendMessage(chatId, { text: `🎥 No preview available, but here’s a YouTube link:\n${ytUrl}` });
      } else {
        await sock.sendMessage(chatId, { text: "" });
      }
    } else {
      await sock.sendMessage(chatId, { text: "☝️" });
    }
  }
}

async function sendArtist(sock, chatId, artist) {
  const name = artist.name;
  const url = artist.external_urls.spotify;
  const followers = artist.followers?.total?.toLocaleString?.() || "N/A";
  const genres = artist.genres.length ? artist.genres.join(", ") : "N/A";
  const pic = artist.images.length ? artist.images[0].url : null;

  const reply = `👤 *${name}*\n🎼 Genres: ${genres}\n👥 Followers: ${followers}\n🔗 [Open in Spotify](${url})`;

  if (pic) await sock.sendMessage(chatId, { image: { url: pic }, caption: reply });
  else await sock.sendMessage(chatId, { text: reply });
}

async function sendAlbum(sock, chatId, album) {
  const title = album.name;
  const artist = album.artists.map(a => a.name).join(", ");
  const release = album.release_date;
  const url = album.external_urls.spotify;
  const cover = album.images.length ? album.images[0].url : null;

  const reply = `💽 *${title}*\n👤 Artist: ${artist}\n📅 Released: ${release}\n🔗 [Open in Spotify](${url})`;

  if (cover) await sock.sendMessage(chatId, { image: { url: cover }, caption: reply });
  else await sock.sendMessage(chatId, { text: reply });
}

async function sendPlaylist(sock, chatId, playlist) {
  const title = playlist.name;
  const owner = playlist.owner.display_name || "Unknown";
  const tracks = playlist.tracks?.total || "N/A";
  const url = playlist.external_urls.spotify;
  const cover = playlist.images.length ? playlist.images[0].url : null;

  const reply = `📂 *${title}*\n👤 By: ${owner}\n🎵 Tracks: ${tracks}\n🔗 [Open in Spotify](${url})`;

  if (cover) await sock.sendMessage(chatId, { image: { url: cover }, caption: reply });
  else await sock.sendMessage(chatId, { text: reply });
}
