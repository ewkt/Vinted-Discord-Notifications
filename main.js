import Discord from "discord.js";
import Database from 'better-sqlite3';
import fs from 'fs';

import {run} from "./src/bot/run.js";
import {init} from "./src/db/db.js";
import {autobuy, checkAndRefreshTokens} from "./src/bot/actions.js";

const proxies = fs.readFileSync('./config/proxies.txt', 'utf8').split('\n').map(proxy => proxy.trim()).filter(proxy => proxy).map(proxy => `http://${proxy.trim()}`);
const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));
const tokens = JSON.parse(fs.readFileSync('./config/tokens.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
let processedArticleIds = new Set();
let db = new Database('./vinted.db');

//connect the bot to the server and initialize the database
client.login(config.bot_token);
init(db, processedArticleIds);

//launch the bot
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    run(client, db, processedArticleIds, mySearches, config, proxies)
});

//listen to buy button-presses
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [sellerId, itemId] = interaction.message.embeds[0].footer.text.split('-');

    // Check and refresh tokens before performing actions
    await checkAndRefreshTokens();

    if (interaction.customId === 'autobuy') {
        autobuy(interaction, itemId, sellerId, tokens.access_token, tokens.xcsrf_token, config.latitude, config.longitude);
    }
});
