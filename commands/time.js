// commands/time.js
const axios = require("axios");
const fetch = require('node-fetch');

// commands/time.js
const moment = require("moment-timezone");

//const OWNER_NUMBER = "2547XXXXXXXX@s.whatsapp.net"; // your WhatsApp ID

// Expanded map of cities/countries -> IANA timezones
const timezoneMap = {
  // Africa
  nairobi: "Africa/Nairobi",
  kenya: "Africa/Nairobi",
  lagos: "Africa/Lagos",
  nigeria: "Africa/Lagos",
  cairo: "Africa/Cairo",
  egypt: "Africa/Cairo",
  johannesburg: "Africa/Johannesburg",
  southafrica: "Africa/Johannesburg",
  addisababa: "Africa/Addis_Ababa",
  ethiopia: "Africa/Addis_Ababa",

  // Asia
  tokyo: "Asia/Tokyo",
  japan: "Asia/Tokyo",
  seoul: "Asia/Seoul",
  korea: "Asia/Seoul",
  beijing: "Asia/Shanghai",
  china: "Asia/Shanghai",
  shanghai: "Asia/Shanghai",
  mumbai: "Asia/Kolkata",
  delhi: "Asia/Kolkata",
  india: "Asia/Kolkata",
  karachi: "Asia/Karachi",
  pakistan: "Asia/Karachi",
  bangkok: "Asia/Bangkok",
  thailand: "Asia/Bangkok",
  dubai: "Asia/Dubai",
  uae: "Asia/Dubai",
  jakarta: "Asia/Jakarta",
  indonesia: "Asia/Jakarta",
  manila: "Asia/Manila",
  philippines: "Asia/Manila",

  // Europe
  london: "Europe/London",
  uk: "Europe/London",
  paris: "Europe/Paris",
  france: "Europe/Paris",
  berlin: "Europe/Berlin",
  germany: "Europe/Berlin",
  rome: "Europe/Rome",
  italy: "Europe/Rome",
  madrid: "Europe/Madrid",
  spain: "Europe/Madrid",
  amsterdam: "Europe/Amsterdam",
  netherlands: "Europe/Amsterdam",
  moscow: "Europe/Moscow",
  russia: "Europe/Moscow",

  // North America
  newyork: "America/New_York",
  usa: "America/New_York",
  washington: "America/New_York",
  losangeles: "America/Los_Angeles",
  la: "America/Los_Angeles",
  california: "America/Los_Angeles",
  chicago: "America/Chicago",
  houston: "America/Chicago",
  mexico: "America/Mexico_City",
  toronto: "America/Toronto",
  canada: "America/Toronto",
  vancouver: "America/Vancouver",

  // South America
  sao_paulo: "America/Sao_Paulo",
  brazil: "America/Sao_Paulo",
  buenosaires: "America/Argentina/Buenos_Aires",
  argentina: "America/Argentina/Buenos_Aires",
  lima: "America/Lima",
  peru: "America/Lima",
  santiago: "America/Santiago",
  chile: "America/Santiago",

  // Oceania
  sydney: "Australia/Sydney",
  australia: "Australia/Sydney",
  melbourne: "Australia/Melbourne",
  brisbane: "Australia/Brisbane",
  perth: "Australia/Perth",
  auckland: "Pacific/Auckland",
  newzealand: "Pacific/Auckland",
};

module.exports = {
  name: "time",
  description: "Get the current time of a given place (owner-only)",
  execute: async (sock, chatId, userMessage, sender) => {
    try {
     /* if (sender !== OWNER_NUMBER) {
        return await sock.sendMessage(chatId, {
          text: "❌ Only the bot owner can use this command.",
        });
      }*/

      const place = userMessage.split(" ").slice(1).join(" ").trim().toLowerCase();
      if (!place) {
        return await sock.sendMessage(chatId, {
          text: "🌍 Usage: .time <place>\nExample: .time Nairobi, .time Tokyo, .time London",
        });
      }

      const key = place.replace(/\s+/g, ""); // handle "new york" -> "newyork"
      const tz = timezoneMap[key];

      if (!tz) {
        return await sock.sendMessage(chatId, {
          text: `⚠️ I don't recognize "${place}".\nTry examples like:\n- Nairobi\n- Tokyo\n- London\n- Paris\n- New York\n- Sydney\n- Dubai\n- Lagos`,
        });
      }

      const now = moment().tz(tz).format("dddd, MMMM Do YYYY, h:mm:ss A");
      await sock.sendMessage(chatId, {
        text: `🕒 Current time in *${place.charAt(0).toUpperCase() + place.slice(1)}*:\n${now}`,
      });
    } catch (err) {
      console.error("Error in .time:", err.message);
      await sock.sendMessage(chatId, {
        text: "⚠️ Couldn't fetch time. Try again.",
      });
    }
  },
};

