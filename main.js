import fs from 'fs';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

import { run } from "./src/run.js";
import { registerCommands, handleCommands } from "./src/commands.js";

const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Default country settings (in case selection fails)
let BASE_URL = countrySettings["France"].url;
let BASE_CURRENCY = countrySettings["France"].currency;

//launch the bot
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(client);
    run(client, mySearches);
});

rl.question(`Select a country (${Object.keys(countrySettings).join(', ')}): `, (userCountry) => {
    userCountry = userCountry.trim();

    // Validate user input
    if (countrySettings[userCountry]) {
        BASE_URL = countrySettings[userCountry].url;
        BASE_CURRENCY = countrySettings[userCountry].currency;
    } else {
        console.log("Invalid country. Defaulting to France.");
    }
});
