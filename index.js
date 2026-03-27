require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🌱 Grow a Garden bot is alive!');
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});

const client = new Client();

const EMOJIS = {
    // 🌾 SEEDS
    "Carrot": "🥕",
    "Strawberry": "🍓",
    "Blueberry": "🫐",
    "Buttercup": "🌼",
    "Tomato": "🍅",
    "Corn": "🌽",
    "Daffodil": "🌼",
    "Watermelon": "🍉",
    "Pumpkin": "🎃",
    "Apple": "🍎",
    "Bamboo": "🎋",
    "Coconut": "🥥",
    "Cactus": "🌵",
    "Dragon Fruit": "🐉",
    "Mango": "🥭",
    "Grape": "🍇",
    "Mushroom": "🍄",
    "Pepper": "🌶️",
    "Cacao": "🍫",
    "Sunflower": "🌻",
    "Beanstalk": "🌱",
    "Ember Lily": "🔥",
    "Sugar Apple": "🍏",
    "Burning Bud": "🔥",
    "Giant Pipecone": "🌲",
    "Elder Strawberry": "🍓",
    "Romanesco": "🥦",
    "Crimson Thorn": "🌹",
    "Zebrazinkle": "🌀",
    "Octobloom": "🌸",
    "Alien Apple": "🛸",

    // ⚙️ GEAR
    "Watering Can": "💧",
    "Basic Sprinkler": "🚿",
    "Advanced Sprinkler": "🚿",
    "Godly Sprinkler": "✨",
    "Master Sprinkler": "💎",
    "Grandmaster Sprinkler": "👑",
    "Trowel": "🪴",
    "Recall Wrench": "🔩",
    "Medium Toy": "🧸",
    "Pet Name Reroller": "🎲",
    "Pet Lead": "🪢",
    "Medium Treat": "🍖",
    "Magnifying Glass": "🔍",
    "Cleaning Spray": "🧴",
    "Cleansing Pet Shard": "💠",
    "Favorite Tool": "⭐",
    "Harvest Tool": "🔧",
    "Friendship Pot": "🪴",
    "Levelup Lollipop": "🍭",
    "Trading Ticket": "🎟️",

    // 🥚 EGGS
    "Common Egg": "🥚",
    "Uncommon Egg": "🥚",
    "Rare Egg": "🥚",
    "Legendary Egg": "🥚",
    "Mythical Egg": "🥚",
    "Bug Egg": "🐛",
    "Jungle Egg": "🌿"
};

let lastStock = null;
let lastEggs = null;

async function testFetchChannel() {
    try {
        console.log("🔄 Проверка стока...");

        const channel = client.channels.cache.get(process.env.SOURCE_CHANNEL_ID);

        if (!channel) {
            console.log("❌ Канал не найден");
            return;
        }

        const messages = await channel.messages.fetch({ limit: 5 });

        const msg = messages.find(m => 
            m.embeds && 
            m.embeds.length > 0 &&
            m.embeds[0].title &&
            m.embeds[0].title.includes("Grow a Garden")
        );

        if (!msg) {
            console.log("❌ Нет сообщений");
            return;
        }

        const embedMsg = msg.embeds[0];

        // ❌ защита от мусора
        if (!embedMsg.title || !embedMsg.title.toLowerCase().includes('stock')) {
            console.log("🚫 Это не сток embed");
            return;
        }

        console.log("📦 EMBED:", embedMsg.title);

        let seeds = [];
        let gear = [];
        let eggs = [];

        if (embedMsg.fields && embedMsg.fields.length > 0) {
            for (const field of embedMsg.fields) {

                const fieldName = field.name.toLowerCase();
                const lines = field.value.split('\n');

                for (const line of lines) {

                    const cleaned = line
                        .replace(/<:[^>]+>/g, '')   // убрать эмодзи
                        .replace(/\*\*/g, '')       // убрать **
                        .trim();

                    const match = cleaned.match(/x(\d+)\s+(.+)/i);
                    if (!match) continue;

                    const count = parseInt(match[1]);
                    const itemName = match[2].trim();

                    const item = { name: itemName, count };

                    if (fieldName.includes('seed')) {
                        seeds.push(item);
                    } else if (fieldName.includes('gear')) {
                        gear.push(item);
                    } else if (fieldName.includes('eggs')) {
                        eggs.push(item);
                    }
                }
            }
        }

        console.log("🌾 SEEDS:", seeds);
        console.log("⚙️ GEAR:", gear);

        // 🧠 сравнение
        const currentStock = JSON.stringify({ seeds, gear, eggs });

        if (currentStock === lastStock) {
            console.log("⏸️ Сток не изменился");
            return;
        }

        lastStock = currentStock;

        console.log("🚀 Новый сток!");

        const currentEggs = JSON.stringify(eggs);

        let showEggs = true;

        if (currentEggs === lastEggs) {
            showEggs = false;
        }

        lastEggs = currentEggs;

        // =========================
        // ✨ СОЗДАЁМ EMBED
        // =========================

        const embed = {
            title: "🌱 GROW A GARDEN | STOCK",
            color: 0x00ff00,
            fields: [],
            footer: {
                text: `Last update: ${new Date().toUTCString()}`
            }
        };

        if (seeds.length > 0) {
            const seedText = seeds
                .map(i => `- ${i.name} ${EMOJIS[i.name] || ""} — ${i.count}`)
                .join('\n');

            embed.fields.push({
                name: "🌾 SEEDS",
                value: seedText,
                inline: false
            });
        }

        if (gear.length > 0) {
            const gearText = gear
                .map(i => `- ${i.name} ${EMOJIS[i.name] || ""} — ${i.count}`)
                .join('\n');

            embed.fields.push({
                name: "⚙️ GEAR",
                value: gearText,
                inline: false
            });
        }

        if (eggs.length > 0 && showEggs) {
            const eggsText = eggs
                .map(i => `- ${i.name} ${EMOJIS[i.name] || ""} — ${i.count}`)
                .join('\n');

            embed.fields.push({
                name: "🥚 EGGS",
                value: eggsText,
                inline: false
            });
        }

        // =========================
        // 📤 ОТПРАВКА В DISCORD
        // =========================

        await axios.post(process.env.WEBHOOK_URL, {
            embeds: [embed]
        });

        console.log("📨 Отправлено!");

    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    }
}

client.on('ready', async () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);

    await testFetchChannel(); // сразу

    setInterval(testFetchChannel, 30 * 1000); // каждые 30 сек
});

client.login(process.env.USER_TOKEN);
