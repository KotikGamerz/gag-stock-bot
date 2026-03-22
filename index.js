require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const client = new Client();

console.log("TOKEN:", process.env.USER_TOKEN);

client.on('ready', () => {
    console.log(`✅ Залогинен как ${client.user.tag}`);
});

client.login(process.env.VALUE);
