const axios = require('axios');
const moment = require('moment-timezone');

module.exports = async function (sock, chatId, city) {
    try {
        if (!city) {
            await sock.sendMessage(chatId, { text: "🌍 *Usage:* `.weather <city>`\n\nExample: `.weather Nairobi`" });
            return;
        }

        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; // your OpenWeather API Key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

        const { data } = await axios.get(url);

        const weatherEmoji = {
            Thunderstorm: '⛈️',
            Drizzle: '🌦️',
            Rain: '🌧️',
            Snow: '❄️',
            Clear: '☀️',
            Clouds: '☁️',
            Mist: '🌫️',
            Smoke: '💨',
            Haze: '🌁',
            Dust: '🌪️',
            Fog: '🌫️',
            Sand: '🏜️',
            Ash: '🌋',
            Squall: '🌬️',
            Tornado: '🌪️'
        };

        const condition = data.weather[0].main;
        const emoji = weatherEmoji[condition] || '🌍';
        const timezone = data.timezone / 3600;
        const localTime = moment().utcOffset(timezone * 60).format('HH:mm A, dddd');

        const weatherText = `
╭━━━🌤️ *Weather Report* 🌤️━━━╮
┃ 📍 *Location:* ${data.name}, ${data.sys.country}
┃ 🕒 *Local Time:* ${localTime}
┃ ${emoji} *Condition:* ${data.weather[0].description.toUpperCase()}
┃ 🌡️ *Temperature:* ${data.main.temp}°C
┃ 🤒 *Feels Like:* ${data.main.feels_like}°C
┃ 💧 *Humidity:* ${data.main.humidity}%
┃ 🌬️ *Wind:* ${data.wind.speed} m/s
┃ 🌅 *Sunrise:* ${moment.unix(data.sys.sunrise).utcOffset(timezone * 60).format('hh:mm A')}
┃ 🌇 *Sunset:* ${moment.unix(data.sys.sunset).utcOffset(timezone * 60).format('hh:mm A')}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
`;

        await sock.sendMessage(chatId, { text: weatherText.trim() });

    } catch (error) {
        console.error('Error fetching weather:', error.response?.data || error.message);

        if (error.response && error.response.status === 404) {
            await sock.sendMessage(chatId, { text: "❌ *City not found.* Please check your spelling and try again." });
        } else {
            await sock.sendMessage(chatId, { text: "🛈 `PLEASE PGRADE TO THE LATEST VERSION OF WHATSAPP TO USE THIS FEATURE`" });
        }
    }
};
