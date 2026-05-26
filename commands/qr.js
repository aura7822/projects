// commands/qr.js
const QRCode = require("qrcode");
const Jimp = require("jimp");

module.exports = {
  name: "qr",
  description: "Generate a QR code with 'Scan Me' label",
  execute: async (sock, chatId, userMessage) => {
    try {
      const text = userMessage.split(" ").slice(1).join(" ");
      if (!text) {
        await sock.sendMessage(chatId, { text: "❌ Please provide text or link.\nExample: .qr aura" });
        return;
      }

      // Generate QR code buffer
      const qrBuffer = await QRCode.toBuffer(text, { type: "png", errorCorrectionLevel: "H", margin: 2 });

      // Load QR code into Jimp
      const qrImage = await Jimp.read(qrBuffer);

      // Create label
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      qrImage.print(
        font,
        0,
        qrImage.bitmap.height - 20, // position at bottom
        {
          text: "📱 Scan Me",
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        qrImage.bitmap.width,
        20
      );

      // Get final buffer
      const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);

      await sock.sendMessage(chatId, {
        image: finalBuffer,
        caption: `✅ *QR Code generated for*:\n"${text}"`
      });

    } catch (error) {
      console.error("Error in .qr command:", error);
      await sock.sendMessage(chatId, { text: `❌ Error generating QR code: ${error.message}` });
    }
  }
};
