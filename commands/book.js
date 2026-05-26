// commands/book.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");



module.exports = {
  name: "book",
  description: "Search and download books as PDF",
  category: "utility",

  async execute(sock, chatId, userMessage) {
    try {
      const query = userMessage.replace(".book", "").trim();
      if (!query) {
        await sock.sendMessage(chatId, { text: "📚 Usage: *.book <title or author>*" });
        return;
      }

      let books = [];

      // STEP 1: Try Gutendex first
      try {
        const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}`);
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            books = data.results.slice(0, 5).map((b, i) => ({
              index: i + 1,
              title: b.title,
              author: b.authors.length > 0 ? b.authors[0].name : "Unknown Author",
              pdf: b.formats["application/pdf"] || null,
            }));
          }
        }
      } catch (err) {
        console.warn("Gutendex failed, switching to OpenLibrary:", err.message);
      }

      // STEP 2: Fallback to OpenLibrary
      if (books.length === 0) {
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.docs && data.docs.length > 0) {
            books = data.docs.slice(0, 5).map((b, i) => ({
              index: i + 1,
              title: b.title,
              author: b.author_name ? b.author_name[0] : "Unknown Author",
              readLink: b.key ? `https://openlibrary.org${b.key}` : null,
              pdf: b.ia && b.ia[0] 
                ? `https://archive.org/download/${b.ia[0]}/${b.ia[0]}.pdf` 
                : null, // tries to get IA PDF
            }));
          }
        }
      }

      // STEP 3: No results
      if (books.length === 0) {
        await sock.sendMessage(chatId, { text: `❌ No books found for *${query}*.` });
        return;
      }

      // STEP 4: Send book list
      let list = "📚 *Choose a Book* 📚\n\n";
      books.forEach(b => {
        list += `*${b.index}.* ${b.title} — ${b.author}\n`;
      });
      list += `\nReply with *.book <number>* to download as PDF (if available).`;

      await sock.sendMessage(chatId, { text: list });

      // Cache choices for this chat
      if (!global.bookChoices) global.bookChoices = {};
      global.bookChoices[chatId] = books;

    } catch (err) {
      console.error("Book command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch book information." });
    }
  },

  async select(sock, chatId, userMessage) {
    try {
      const books = global.bookChoices?.[chatId];
      if (!books || books.length === 0) return;

      const num = parseInt(userMessage.replace(".book", "").trim());
      if (isNaN(num) || num < 1 || num > books.length) return;

      const chosen = books[num - 1];

      if (chosen.pdf) {
        // Download the PDF to buffer before sending
        try {
          const res = await fetch(chosen.pdf);
          if (!res.ok) throw new Error("Failed to download PDF");
          const buffer = await res.buffer();

          await sock.sendMessage(chatId, {
            document: buffer,
            mimetype: "application/pdf",
            fileName: `${chosen.title}.pdf`,
            caption: `📖 *${chosen.title}* by ${chosen.author}`,
          });
        } catch (err) {
          console.warn("PDF download failed, fallback to link:", err.message);
          await sock.sendMessage(chatId, {
            text: `📖 *${chosen.title}* by ${chosen.author}\n\n🔗 Read here: ${chosen.readLink || "Not available"}`,
          });
        }
      } else if (chosen.readLink) {
        await sock.sendMessage(chatId, {
          text: `📖 *${chosen.title}* by ${chosen.author}\n\n🔗 Read here: ${chosen.readLink}`,
        });
      } else {
        await sock.sendMessage(chatId, { text: "❌ No PDF or link available for this book." });
      }

      delete global.bookChoices[chatId];
    } catch (err) {
      console.error("Book select error:", err);
    }
  }
};
