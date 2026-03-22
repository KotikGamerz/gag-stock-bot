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

        console.log("📩 Сообщение найдено:");
        console.log("Автор:", msg.author?.tag);
        console.log("Текст:", msg.content);
        console.log("Embeds:", msg.embeds.length);

        if (msg.embeds.length > 0) {
        const embed = msg.embeds[0];

        console.log("📦 EMBED TITLE:", embed.title);
        console.log("📦 EMBED DESC:", embed.description);

        if (embed.fields && embed.fields.length > 0) {
            console.log("📦 FIELDS:");
            for (const field of embed.fields) {
            console.log(`➡️ ${field.name}: ${field.value}`);
            }
        }
    }

    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    }
}

client.on('ready', async () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);

    await testFetchChannel();
});

client.login(process.env.USER_TOKEN);
