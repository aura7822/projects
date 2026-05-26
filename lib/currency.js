const axios = require("axios");

async function handleCurrency(sock, chatId, args) {
    try {
        if (args.length < 3) {
            await sock.sendMessage(chatId, { 
                text: "❌ Usage: .convert <amount> <from> to <to>\nExample: `.convert 100 USD to KES`"
            });
            return;
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();

        // Find "to" keyword in args
        const toIndex = args.findIndex(a => a.toLowerCase() === "to");
        const to = toIndex !== -1 ? args[toIndex + 1]?.toUpperCase() : null;

        if (isNaN(amount) || !from || !to) {
            await sock.sendMessage(chatId, { 
                text: "⚠️ Invalid format. Example: `.convert 100 USD to KES`"
            });
            return;
        }

        let result = null;

        // 🔹 API 1: exchangerate.host
        try {
            const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
            console.log("🌍 Trying API1:", url);
            const response = await axios.get(url);
            if (response.data?.result) {
                result = response.data.result;
            }
        } catch (e) {
            console.error("❌ API1 failed:", e.message);
        }

        // 🔹 API 2: Frankfurter.app
        if (!result) {
            try {
                const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
                console.log("🌍 Trying API2:", url);
                const response = await axios.get(url);
                if (response.data?.rates?.[to]) {
                    result = response.data.rates[to];
                }
            } catch (e) {
                console.error("❌ API2 failed:", e.message);
            }
        }

        // 🔹 API 3: open.er-api.com (free keyless)
        if (!result) {
            try {
                const url = `https://open.er-api.com/v6/latest/${from}`;
                console.log("🌍 Trying API3:", url);
                const response = await axios.get(url);
                if (response.data?.rates?.[to]) {
                    result = response.data.rates[to] * amount;
                }
            } catch (e) {
                console.error("❌ API3 failed:", e.message);
            }
        }

        if (!result) {
            await sock.sendMessage(chatId, { 
                text: "⚠️ Could not fetch conversion result from any provider."
            });
            return;
        }

        await sock.sendMessage(chatId, { 
            text: `💱 *Currency Conversion*\n\n${amount} ${from} = *${result.toFixed(2)} ${to}*`
        });

    } catch (error) {
        console.error("[CurrencyCmd] Error:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Error while converting currency.\n\n🔍 Debug Info:\n```" + error.message + "```"
        });
    }
}


module.exports = { handleCurrency };
