// commands/recipe.js
const fetch = require("node-fetch");
const axios = require('axios');

module.exports = {
  name: "recipe",
  description: "Get a recipe for any food or a random recipe",
  category: "fun",

  async execute(sock, chatId, userMessage) {
    try {
      const args = userMessage.split(" ").slice(1).join(" ");
      let apiUrl;

      if (!args) {
        // If no food name provided → random recipe
        apiUrl = "https://www.themealdb.com/api/json/v1/1/random.php";
      } else {
        // Search recipe by name
        const query = encodeURIComponent(args);
        apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
      }

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data.meals) {
        await sock.sendMessage(chatId, { text: `❌ No recipe found for "${args}". Try another dish.` });
        return;
      }

      const meal = data.meals[0];
      const name = meal.strMeal;
      const category = meal.strCategory;
      const area = meal.strArea;
      const instructions = meal.strInstructions;
      const thumbnail = meal.strMealThumb;

      // Ingredients & Measures
      let ingredients = "";
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients += `- ${ingredient} (${measure})\n`;
        }
      }

      const message = `🍴 *${name}*\n📌 Category: ${category}\n🌍 Origin: ${area}\n\n🥕 *Ingredients:*\n${ingredients}\n👨‍🍳 *Instructions:*\n${instructions}`;

      await sock.sendMessage(chatId, {
        image: { url: thumbnail },
        caption: message
      });

    } catch (err) {
      console.error("Recipe command error:", err);
      await sock.sendMessage(chatId, { text: "❌ Failed to fetch recipe. Please try again later." });
    }
  }
};
