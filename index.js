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

client.on('ready', () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);
});

client.login(process.env.USER_TOKEN);
