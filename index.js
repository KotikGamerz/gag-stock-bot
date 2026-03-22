require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🌱 Grow a Garden bot is alive!');
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});

const client = new Client();

let lastStock = null;

async function testFetchChannel() {
    try {
        const channel = client.channels.cache.get(process.env.SOURCE_CHANNEL_ID);

        if (!channel) {
            console.log("❌ Канал не найден");
            return;
        }

        const messages = await channel.messages.fetch({ limit: 1 });
        const msg = messages.first();

        if (!msg) {
            console.log("❌ Нет сообщений");
            return;
        }

        if (!msg.embeds || msg.embeds.length === 0) {
            console.log("🚫 Это не сток (нет embed, скорее реклама)");
            return;
        }

        console.log("📩 Сообщение найдено:");
        console.log("Автор:", msg.author?.tag);
        console.log("Текст:", msg.content);
        console.log("Embeds:", msg.embeds.length);

        const embed = msg.embeds[0];

        console.log("📦 EMBED TITLE:", embed.title);

        let seeds = [];
        let gear = [];

        if (embed.fields && embed.fields.length > 0) {
            for (const field of embed.fields) {

                const fieldName = field.name.toLowerCase();
                const lines = field.value.split('\n');

                for (const line of lines) {

                    const cleaned = line
                        .replace(/<:[^>]+>/g, '')   // убираем эмодзи
                        .replace(/\*\*/g, '')       // убираем **
                        .trim();

                    const match = cleaned.match(/x(\d+)\s+(.+)/i);

                    if (!match) continue;

                    const count = parseInt(match[1]);
                    const itemName = match[2].trim();

                    const item = {
                        name: itemName,
                        count: count
                    };

                    if (fieldName.includes('seed')) {
                        seeds.push(item);
                    } else if (fieldName.includes('gear')) {
                        gear.push(item);
                    }
                }
            }
        }

        console.log("🌾 SEEDS PARSED:", seeds);
        console.log("⚙️ GEAR PARSED:", gear);

        const currentStock = JSON.stringify({ seeds, gear });

        if (currentStock === lastStock) {
            console.log("⏸️ Сток не изменился");
            return;
        }

lastStock = currentStock;

console.log("🚀 Новый сток найден!");

    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    }
}

client.on('ready', async () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);
    setInterval(testFetchChannel, 30 * 1000);
});

client.login(process.env.USER_TOKEN);
