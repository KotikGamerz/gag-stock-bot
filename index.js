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
    "Giant Pinecone": "🌲",
    "Elder Strawberry": "🍓",
    "Romanesco": "🥦",
    "Crimson Thorn": "🌹",
    "Zebrazinkle": "🌀",
    "Octobloom": "🌸",
    "Alien Apple": "🛸",
    "Tiki Totem": "🟤",

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

const GH_EMOJIS = {
    // Seeds
    "Rose": "🌹",
    "Apple": "🍎",
    "Tomato": "🍅",
    "Beetroot": "🫜",
    "Mushroom": "🍄",
    "Strawberry": "🍓",
    "Onion": "🧅",
    "Corn": "🌽",
    "Carrot": "🥕",
    "Pineapple": "🍍",
    "Watermelon": "🍉",
    "Mango": "🥭",
    "Cherry": "🍒",
    "Bamboo": "🎍",
    "Cabbage": "🥬",
    "Potato": "🥔",
    "Plum": "🟣",
    "Banana": "🍌",
    "Wheat": "🌾",

    // Gear
    "Reverter": "♻️",
    "Trowel": "🪏",
    "Magnifying Glass": "🔍",
    "Super Sprinkler": "🚿",
    "Favorite Tool": "⭐",
    "Turbo Sprinkler": "💨",
    "Harvest Bell": "🔔",
    "Basic Sprinkler": "💦",
    "Watering Can": "💧",

    // Weather
    "Fog": "🌫️",
    "Rain": "🌧️",
    "Sandstorm": "🌪️",
    "Snow": "❄️",
    "Starfall": "🌠",
    "Storm": "⛈️",
};

const RARE_ITEMS = {
    seeds: [
        "Pepper",
        "Cacao",
        "Sunflower",
        "Beanstalk",
        "Ember Lily",
        "Sugar Apple",
        "Burning Bud",
        "Giant Pinecone",
        "Elder Strawberry",
        "Romanesco",
        "Crimson Thorn",
        "Zebrazinkle",
        "Octobloom",
        "Alien Apple",
        "Tiki Totem"
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
    "Pepper": "1498259306624188436",
    "Cacao": "1498259843264544818",
    "Sunflower": "1498259988878200922",
    "Beanstalk": "1498260076950061246",
    "Ember Lily": "1498260222949462037",
    "Sugar Apple": "1498260292767973416",
    "Burning Bud": "1486395632796303541",
    "Giant Pinecone": "1486395629310705815",
    "Elder Strawberry": "1486395626202730506",
    "Romanesco": "1486395622780043458",
    "Crimson Thorn": "1486395619634581585",
    "Zebrazinkle": "1486395616505630950",
    "Octobloom": "1486395613200257156",
    "Alien Apple": "1486395609752535120",
    "Tiki Totem": "1490567124777959544",

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

let lastEggsMessageIdForDisplay = null;
let lastAdminMessageId = null;

let isCheckingGH = false;

let lastGHMessageIds = {
    seeds: null,
    gear: null
};

let lastGHWeatherMessageIdForDisplay = null;

const ENABLE_GH_STOCK =
    process.env.ENABLE_GH_STOCK !== 'false';

async function sendToWebhooks(
    payload,
    webhookUrls = [
        process.env.WEBHOOK_URL,
        process.env.KIRO_WEBHOOK_URL
    ]
) {
    const urls = webhookUrls.filter(Boolean);

    if (!urls.length) {
        console.log("❌ Нет вебхуков для отправки");
        return;
    }

    const results = await Promise.allSettled(
        urls.map(url =>
            axios.post(url, payload)
        )
    );

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`✅ Webhook #${index + 1} отправлен`);
        } else {
            console.error(
                `❌ Webhook #${index + 1} ошибка:`,
                result.reason?.response?.data ||
                result.reason?.message
            );
        }
    });
}

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

// ==================================================
// 🌱 GARDEN HORIZONS
// ==================================================

async function getGHRoleName(guild, roleId) {
    if (!guild || !roleId) return null;

    const cachedRole = guild.roles.cache.get(roleId);

    if (cachedRole) {
        return cachedRole.name;
    }

    try {
        const fetchedRole = await guild.roles.fetch(roleId);
        return fetchedRole?.name || null;
    } catch (err) {
        console.log(
            `⚠️ Не удалось получить название роли ${roleId}:`,
            err.message
        );

        return null;
    }
}

async function parseGHStockText(text, guild) {
    const items = [];

    for (const rawLine of text.split('\n')) {
        const line = rawLine
            .replace(/^[•\-]\s*/, '')
            .trim();

        if (!line) continue;

        /*
            Поддерживает оба варианта:

            <@&123456789> (x8)
            Magnifying Glass (x1)
        */
        const match = line.match(
            /^(?:<@&(\d+)>|(.+?))\s*\(x(\d+)\)$/i
        );

        if (!match) continue;

        const roleId = match[1] || null;
        const plainName = match[2]?.trim() || null;
        const count = Number(match[3]);

        let name = plainName;

        if (roleId) {
            name = await getGHRoleName(guild, roleId);
        }

        if (!name || !Number.isFinite(count)) {
            console.log("⚠️ GH строка не распознана:", line);
            continue;
        }

        items.push({
            name,
            count
        });
    }

    return items;
}

async function fetchGHStock(channelId, shopType) {
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.log(`❌ GH ${shopType} канал не найден: ${channelId}`);
        return null;
    }

    const messages = await channel.messages.fetch({
        limit: 5
    });

    const sorted = [...messages.values()]
        .sort(
            (a, b) =>
                b.createdTimestamp -
                a.createdTimestamp
        );

    const requiredTitle =
        shopType === 'seeds'
            ? 'seed shop'
            : 'gear shop';

    const msg = sorted.find(message => {
        if (!message.embeds?.length) return false;

        const title =
            (message.embeds[0].title || '')
                .toLowerCase();

        return title.includes(requiredTitle);
    });

    if (!msg) {
        console.log(`⚠️ GH ${shopType} embed не найден`);
        return null;
    }

    const embed = msg.embeds[0];

    const text =
        embed.description ||
        embed.fields?.map(field => field.value).join('\n') ||
        '';

    const items = await parseGHStockText(
        text,
        msg.guild
    );

    return {
        items,
        messageId: msg.id
    };
}

async function fetchGHWeather() {
    const channel = client.channels.cache.get(
        process.env.GH_WEATHER_CHANNEL_ID
    );

    if (!channel) {
        console.log("❌ GH Weather канал не найден");
        return null;
    }

    const messages = await channel.messages.fetch({
        limit: 5
    });

    const sorted = [...messages.values()]
        .sort(
            (a, b) =>
                b.createdTimestamp -
                a.createdTimestamp
        );

    const msg = sorted.find(message => {
        if (!message.embeds?.length) return false;

        const title =
            (message.embeds[0].title || '')
                .toLowerCase();

        return title.includes('weather update');
    });

    if (!msg) {
        console.log("ℹ️ GH Weather embed не найден");
        return null;
    }

    const embed = msg.embeds[0];

    const text =
        embed.description ||
        embed.fields?.map(field => field.value).join('\n') ||
        '';

    /*
        Поддерживает:

        It's now <@&123456789>!
        It's now @Fog!
        It's now Fog!
    */
    const match = text.match(
        /it's now\s+(?:<@&(\d+)>|@?([^!\n]+))!/i
    );

    if (!match) {
        console.log(
            "⚠️ Не удалось распознать GH weather:",
            text
        );

        return null;
    }

    const roleId = match[1] || null;
    const plainName = match[2]?.trim() || null;

    let name = plainName;

    if (roleId) {
        name = await getGHRoleName(
            msg.guild,
            roleId
        );
    }

    if (!name) {
        console.log("⚠️ Название GH weather не получено");
        return null;
    }

    return {
        name,
        messageId: msg.id
    };
}

function renderGHItems(items) {
    return items
        .map(item =>
            `- ${GH_EMOJIS[item.name] || "•"} ${item.name} — ${item.count}`
        )
        .join('\n');
}

async function sendGHStockEmbed(
    seeds,
    gear,
    weatherName = null
) {
    const now = new Date();

    const embed = {
        title: "🌱 GARDEN HORIZONS | STOCK",
        color: 0x55dd88,
        fields: [],
        footer: {
            text:
                `Last update: ` +
                now.toLocaleTimeString('en-GB')
        },
        timestamp: now.toISOString()
    };

    embed.fields.push({
        name: "🌾 SEEDS",
        value: renderGHItems(seeds),
        inline: false
    });

    embed.fields.push({
        name: "⚙️ GEAR",
        value: renderGHItems(gear),
        inline: false
    });

    if (weatherName) {
        embed.fields.push({
            name: "☀️ WEATHER",
            value: `- ${GH_EMOJIS[weatherName] || "•"} ${weatherName}`,
            inline: false
        });
    }

    /*
        Пока пингов нет.

        Позже сюда легко добавим:
        const pingText = getGHPingText(seeds, gear, weatherName);

        и затем:
        content: pingText || null
    */

    const webhookUrls = [
        process.env.GH_WEBHOOK_URL
    ];

    if (process.env.KIRO_GH_WEBHOOK_URL) {
        webhookUrls.push(
            process.env.KIRO_GH_WEBHOOK_URL
        );
    }

    await sendToWebhooks(
        {
            embeds: [embed]
        },
        webhookUrls
    );

    console.log("🌱 Garden Horizons stock отправлен");
}

async function checkGHStocks() {
    if (isCheckingGH) {
        console.log("⏸️ GH проверка уже выполняется");
        return;
    }

    isCheckingGH = true;

    try {
        console.log("🌱 Проверка Garden Horizons...");

        const [seedsData, gearData, weatherData] =
            await Promise.all([
                fetchGHStock(
                    process.env.GH_SEEDS_CHANNEL_ID,
                    'seeds'
                ),
                fetchGHStock(
                    process.env.GH_GEAR_CHANNEL_ID,
                    'gear'
                ),
                fetchGHWeather()
            ]);

        if (!seedsData || !gearData) {
            console.log("❌ GH: нет seeds или gear");
            return;
        }

        if (!seedsData.items.length) {
            console.log("❌ GH: seeds не распознаны");
            return;
        }

        if (!gearData.items.length) {
            console.log("❌ GH: gear не распознаны");
            return;
        }

        const stockChanged =
            seedsData.messageId !==
                lastGHMessageIds.seeds ||
            gearData.messageId !==
                lastGHMessageIds.gear;

        if (!stockChanged) {
            console.log("⏸️ GH stock уже обработан");
            return;
        }

        /*
            Погоду показываем только один раз.

            Если сообщение Weather новое, оно прикрепится
            к этому новому stock embed.

            При следующем обычном рестоке Weather уже
            показываться не будет.
        */
        const showWeather =
            weatherData &&
            weatherData.messageId !==
                lastGHWeatherMessageIdForDisplay;

        const weatherName =
            showWeather
                ? weatherData.name
                : null;

        lastGHMessageIds = {
            seeds: seedsData.messageId,
            gear: gearData.messageId
        };

        if (showWeather) {
            lastGHWeatherMessageIdForDisplay =
                weatherData.messageId;
        }

        await sendGHStockEmbed(
            seedsData.items,
            gearData.items,
            weatherName
        );

    } catch (err) {
        console.error(
            "❌ Garden Horizons ошибка:",
            err
        );
    } finally {
        isCheckingGH = false;
    }
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

    const title = embed.title?.toLowerCase() || '';

    const isAdmin =
        title.includes('admin');

    const text =
        embed.description ||
        embed.fields?.map(f => f.value).join('\n') ||
        '';

    return {
        items: parseStockText(text),
        messageId: msg.id,
        isAdmin
    };
}

async function sendStockEmbed(seeds, gear, eggs, showEggs) {

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
    if (eggs.length > 0 && showEggs) {
        embed.fields.push({
            name: "🥚 EGGS",
            value: eggs
                .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                .join('\n'),
            inline: false
        });
    }

    const pingText = getPingText(
        seeds,
        gear,
        showEggs ? eggs : []
    );

    await sendToWebhooks({
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

        let showEggs = false;

        const isAdminSeeds = seedsData.isAdmin;
        const isAdminGear  = gearData.isAdmin;

        if (isAdminSeeds || isAdminGear) {

        const currentAdminId = (isAdminSeeds ? seedsData.messageId : '') + (isAdminGear ? gearData.messageId : '');

        if (currentAdminId === lastAdminMessageId) {
            console.log("⏸️ ADMIN уже обработан");
            return;
        }

        lastAdminMessageId = currentAdminId;

        console.log("🚨 ADMIN STOCK detected");

        const embed = {
            title: "🛠️ GROW A GARDEN | ADMIN STOCK",
            color: 0xff0000,
            fields: [],
            footer: {
                text: `Admin update: ${new Date().toLocaleTimeString('en-GB')} UTC`
            },
            timestamp: new Date().toISOString()
        };

        if (isAdminSeeds && seeds.length > 0) {
            embed.fields.push({
                name: "🌾 SEEDS",
                value: seeds
                    .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                    .join('\n'),
                inline: false
            });
        }

        if (isAdminGear && gear.length > 0) {
            embed.fields.push({
                name: "⚙️ GEAR",
                value: gear
                    .map(i => `- ${EMOJIS[i.name] || ""} ${i.name} — ${i.count}`)
                    .join('\n'),
                inline: false
            });
        }

        const pingText = getPingText(
            isAdminSeeds ? seeds : [],
            isAdminGear ? gear : [],
            []
        );

        await sendToWebhooks({
            content: pingText || null,
            embeds: [embed]
        });

        console.log("🚨 ADMIN STOCK отправлен");

        return;
        }

        if (eggsData?.messageId !== lastEggsMessageIdForDisplay) {
            showEggs = true;
            lastEggsMessageIdForDisplay = eggsData?.messageId;
            console.log("🥚 Яйца обновились");
        }

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

        await sendStockEmbed(seeds, gear, eggs, showEggs);

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

            await Promise.all([
                checkAllStocks(),

                ENABLE_GH_STOCK
                    ? checkGHStocks()
                    : Promise.resolve()
            ]);

            scheduleNext();

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
