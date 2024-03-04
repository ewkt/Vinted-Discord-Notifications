import Discord from "discord.js";
import Database from 'better-sqlite3';
import fs from 'fs';

import fetchCookie from "./src/api/auth.js";
import processChannels from "./src/bot/run.js";
import {init} from "./src/db/db.js";

const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
let processedArticleIds = new Set();
let cookie;
let db = new Database('./articles.db');

//connect the bot to the server and initialize the database
client.login(config.token);
init(db, processedArticleIds);

//search for new articles, post them, and insert them into the database
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        cookie = await fetchCookie();
        process.stdout.write('Searching for new articles');
        processChannels(cookie, client, db, processedArticleIds, config.INTERVAL_TIME);
    } catch (err) {
        console.error(err);
    }
});
