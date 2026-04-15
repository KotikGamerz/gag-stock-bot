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
    "Eggsnaper": "🐣",

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

const RARE_ITEMS = {
    seeds: [
        "Burning Bud",
        "Giant Pipecone",
        "Elder Strawberry",
        "Romanesco",
        "Crimson Thorn",
        "Zebrazinkle",
        "Octobloom",
        "Alien Apple",
        "Eggsnaper"
    ],
    gear: [
        "Levelup Lollipop",
        "Master Sprinkler",
        "Grandmaster Sprinkler"
    ],
    eggs: [
        "Bug Egg",
        "Jungle Egg"
    ]
};

const ROLE_IDS = {
    // 🌾 SEEDS
    "Burning Bud": "1486395632796303541",
    "Giant Pipecone": "1486395629310705815",
    "Elder Strawberry": "1486395626202730506",
    "Romanesco": "1486395622780043458",
    "Crimson Thorn": "1486395619634581585",
    "Zebrazinkle": "1486395616505630950",
    "Octobloom": "1486395613200257156",
    "Alien Apple": "1486395609752535120",
    "Eggsnaper": "1490567124777959544",

    // ⚙️ GEAR
    "Levelup Lollipop": "1486395644821110987",
    "Master Sprinkler": "1486395640786321618",
    "Grandmaster Sprinkler": "1486395636667388025",

    // 🥚 EGGS
    "Bug Egg": "1486395651368554536",
    "Jungle Egg": "1486395647765643447"
};

let lastStock = null;
let lastEggs = null;

function getPingText(seeds, gear, eggs) {
    let pings = [];

    const check = (items, rareList) => {
        for (const i of items) {
            if (rareList.includes(i.name) && ROLE_IDS[i.name]) {
                pings.push(`<@&${ROLE_IDS[i.name]}>`);
            }
        }
    };

    check(seeds, RARE_ITEMS.seeds);
    check(gear, RARE_ITEMS.gear);
    check(eggs, RARE_ITEMS.eggs);

    return pings.join(' ');
}

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

        const now = new Date();
        const unix = Math.floor(now.getTime() / 1000);
        
        const embed = {
            title: "🌱 GROW A GARDEN | STOCK",
            color: 0x00ff00,
            fields: [],
            footer: {
                text: `Last update: ${now.toLocaleTimeString('en-GB')} UTC`
            },
            timestamp: now.toISOString()
        };

        if (seeds.length > 0) {
            const seedText = seeds
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n');

            embed.fields.push({
                name: "🌾 SEEDS",
                value: seedText,
                inline: false
            });
        }

        if (gear.length > 0) {
            const gearText = gear
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n');

            embed.fields.push({
                name: "⚙️ GEAR",
                value: gearText,
                inline: false
            });
        }

        if (eggs.length > 0 && showEggs) {
            const eggsText = eggs
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
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

        const pingText = getPingText(seeds, gear, eggs);

        await axios.post(process.env.WEBHOOK_URL, {
            content: pingText || null,
            embeds: [embed]
        });

        console.log("📨 Отправлено!");

    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    }
}

client.on('ready', async () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);

    await testFetchChannel();
    setInterval(testFetchChannel, 30 * 1000);
});

client.on('error', (err) => {
    console.error("❌ CLIENT ERROR:", err);
});

client.on('disconnect', () => {
    console.log("🔌 DISCONNECTED");
});

client.on('rateLimit', (info) => {
    console.log("⏳ RATE LIMIT:", info);
});

console.log("🔑 TOKEN:", process.env.USER_TOKEN ? "есть" : "нет");

client.login(process.env.USER_TOKEN)
    .then(() => console.log("📲 login() вызван успешно"))
    .catch(err => console.error("❌ LOGIN ERROR:", err));
