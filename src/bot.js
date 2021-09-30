require('dotenv/config');

const { Client } = require('discord.js');
const actions = require('./actions/index');

const client = new Client();

client.on('ready', () => {
    console.log(`Bot started ${client.user.tag}`);
})

client.on('message', async msg => {
    actions(msg);
})


client.login(process.env.BOT_TOKEN);