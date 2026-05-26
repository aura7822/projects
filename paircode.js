import express from "express";
import makeWASocket, { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  res.send("<h2>🟢 Katabump Pairing Server Active!</h2><p>Use /pair to generate a new WhatsApp code.</p>");
});

app.get("/pair", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console),
      },
    });

    let code = await sock.requestPairingCode(process.env.OWNER_NUMBER);
    res.send(`<h1>📱 Pair Code: ${code}</h1><p>Enter this in WhatsApp to link the bot.</p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error generating pairing code.");
  }
});

app.listen(PORT, () => console.log(`✅ Pairing server running on port ${PORT}`));
