require('dotenv/config');

const { Client } = require('discord.js');
const actions = require('./actions/index');

const client = new Client();

client.on('ready', () => {
    console.log(`Bot started ${client.user.tag}`);
});

client.on('message', async msg => {
    actions(msg);
});

;(
    async () => {
        const Player = require('./models/Player');
        const db = require('./config/db');

        try {
            const result = await db.sync();

            await Player.create({
                id: '1',
                name: 'a',
                balance: 0,
            })
        } catch (e) {
            console.log(e);
        }
    }
)();

client.login(process.env.BOT_TOKEN);
