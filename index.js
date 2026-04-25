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
    "Eggsnapper": "🐣",

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
        "Eggsnapper"
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
    "Eggsnapper": "1490567124777959544",

    // ⚙️ GEAR
    "Levelup Lollipop": "1486395644821110987",
    "Master Sprinkler": "1486395640786321618",
    "Grandmaster Sprinkler": "1486395636667388025",

    // 🥚 EGGS
    "Bug Egg": "1486395651368554536",
    "Jungle Egg": "1486395647765643447"
};

let isChecking = false;

let lastProcessedMessageIds = {
    seeds: null,
    gear: null,
    eggs: null
};

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

function parseStockText(text) {
    const items = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const cleaned = line
            .replace(/<:[^>]+>/g, '')
            .replace(/[•]/g, '')
            .replace(/[^\p{L}\p{N}\sx]/gu, '')
            .trim();

        const match = cleaned.match(/^(.+?)\s*x(\d+)$/i);
        if (!match) continue;

        items.push({
            name: match[1].trim(),
            count: parseInt(match[2])
        });
    }

    return items;
}

async function fetchStock(channelId, keyword) {
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.log(`❌ Канал не найден: ${channelId}`);
        return null;
    }

    const messages = await channel.messages.fetch({ limit: 5 });

    const msg = messages.find(m =>
        m.embeds?.length > 0 &&
        m.embeds[0].title?.toLowerCase().includes(keyword)
    );

    if (!msg) {
        console.log(`⚠️ Embed не найден: ${keyword}`);
        return null;
    }

    const embed = msg.embeds[0];

    const text =
        embed.description ||
        embed.fields?.map(f => f.value).join('\n') ||
        '';

    return {
        items: parseStockText(text),
        messageId: msg.id
    };
}

async function sendStockEmbed(seeds, gear, eggs) {

    console.log("🚀 Новый сток (по ID)!");

    const now = new Date();

    const embed = {
        title: "🌱 GROW A GARDEN | STOCK",
        color: 0x00ff00,
        fields: [],
        footer: {
            text: `Last update: ${now.toLocaleTimeString('en-GB')} UTC`
        },
        timestamp: now.toISOString()
    };

    // 🌾 SEEDS
    if (seeds.length > 0) {
        embed.fields.push({
            name: "🌾 SEEDS",
            value: seeds
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n'),
            inline: false
        });
    }

    // ⚙️ GEAR
    if (gear.length > 0) {
        embed.fields.push({
            name: "⚙️ GEAR",
            value: gear
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n'),
            inline: false
        });
    }

    // 🥚 EGGS (ВСЕГДА показываем, если есть)
    if (eggs.length > 0) {
        embed.fields.push({
            name: "🥚 EGGS",
            value: eggs
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n'),
            inline: false
        });
    }

    const pingText = getPingText(seeds, gear, eggs);

    await axios.post(process.env.WEBHOOK_URL, {
        content: pingText || null,
        embeds: [embed]
    });

    console.log("📨 Отправлено!");
}

async function checkAllStocks() {

    if (isChecking) return;
    isChecking = true;

    try {
        console.log("🔄 Проверка нового источника...");

        const seedsData = await fetchStock(process.env.SEEDS_CHANNEL_ID, 'seed');
        const gearData  = await fetchStock(process.env.GEAR_CHANNEL_ID, 'gear');
        const eggsData  = await fetchStock(process.env.EGGS_CHANNEL_ID, 'egg');

        // базовая защита
        if (!seedsData || !gearData) {
            console.log("⏳ Нет seeds или gear");
            return;
        }

        const seeds = seedsData.items;
        const gear  = gearData.items;
        const eggs  = eggsData?.items || [];

        // 🧠 ПРОВЕРКА ПО MESSAGE ID
        const isSameUpdate =
            seedsData.messageId === lastProcessedMessageIds.seeds &&
            gearData.messageId  === lastProcessedMessageIds.gear &&
            (eggsData?.messageId || null) === lastProcessedMessageIds.eggs;

        if (isSameUpdate) {
            console.log("⏸️ Уже обработанный сток (по ID)");
            return;
        }

        // 🧠 ОБНОВЛЯЕМ ID
        lastProcessedMessageIds = {
            seeds: seedsData.messageId,
            gear:  gearData.messageId,
            eggs:  eggsData?.messageId || null
        };

        console.log("📡 Обнаружен новый сток (по ID)");

        await sendStockEmbed(seeds, gear, eggs);

    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    } finally {
        isChecking = false;
    }
}

function startSmartScheduler() {

    const scheduleNext = () => {
        const now = new Date();

        const seconds = now.getSeconds();

        // сколько ждать до следующего 20 или 50
        let targetSecond;

        if (seconds < 20) targetSecond = 20;
        else if (seconds < 50) targetSecond = 50;
        else targetSecond = 80; // 60 + 20

        let delay = (targetSecond - seconds) * 1000;

        console.log(`⏱️ Следующая проверка через ${delay / 1000}s`);

        setTimeout(async () => {
            await checkAllStocks();
            scheduleNext(); // запускаем следующий цикл
        }, delay);
    };

    scheduleNext();
}


client.on('ready', async () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);

    // умный планировщик
    console.log("🧠 Smart scheduler запущен");
    startSmartScheduler();
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
