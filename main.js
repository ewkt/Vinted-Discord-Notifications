import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';
import readline from 'readline';

import { run } from "./src/run.js";
import { registerCommands, handleCommands } from "./src/commands.js";

dotenv.config();

// Supported countries with full names
const countrySettings = {
    "France": { url: "https://www.vinted.fr/", currency: "EUR" },
    "Germany": { url: "https://www.vinted.de/", currency: "EUR" },
    "United Kingdom": { url: "https://www.vinted.co.uk/", currency: "GBP" },
    "United States": { url: "https://www.vinted.com/", currency: "USD" },
    "India": { url: "https://www.vinted.in/", currency: "INR" },
    "Canada": { url: "https://www.vinted.ca/", currency: "CAD" },
    "Italy": { url: "https://www.vinted.it/", currency: "EUR" },
    "Spain": { url: "https://www.vinted.es/", currency: "EUR" },
    "Netherlands": { url: "https://www.vinted.nl/", currency: "EUR" },
    "Belgium": { url: "https://www.vinted.be/", currency: "EUR" },
    "Portugal": { url: "https://www.vinted.pt/", currency: "EUR" },
    "Lithuania": { url: "https://www.vinted.lt/", currency: "EUR" },
    "Latvia": { url: "https://www.vinted.lv/", currency: "EUR" },
    "Estonia": { url: "https://www.vinted.ee/", currency: "EUR" },
    "Poland": { url: "https://www.vinted.pl/", currency: "PLN" },
    "Czech Republic": { url: "https://www.vinted.cz/", currency: "CZK" },
    "Slovakia": { url: "https://www.vinted.sk/", currency: "EUR" },
    "Hungary": { url: "https://www.vinted.hu/", currency: "HUF" }
};

// Ask the user to select a country
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(`Select a country (${Object.keys(countrySettings).join(', ')}): `, (userCountry) => {
    userCountry = userCountry.trim();

    // Validate user input, default to France if invalid
    if (!countrySettings[userCountry]) {
        console.log("Invalid country. Defaulting to France.");
        userCountry = "France";
    }

    // Set base URL and currency dynamically
    const BASE_URL = countrySettings[userCountry].url;
    const BASE_CURRENCY = countrySettings[userCountry].currency;

    console.log(`Bot is running for country: ${userCountry} with currency: ${BASE_CURRENCY}`);
    console.log(`Using Vinted URL: ${BASE_URL}`);

    // Load user searches from the configuration file
    const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));

    // Create a new Discord client with necessary intents
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    let processedArticleIds = new Set();

    // Connect the bot to the Discord server
    client.login(process.env.BOT_TOKEN);

    // When the bot is ready, execute the following
    client.on("ready", async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        registerCommands(client);
        run(client, processedArticleIds, mySearches, BASE_URL, BASE_CURRENCY);
    });

    // Listen to buy button clicks and handle commands
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isCommand()) {
            handleCommands(interaction, mySearches);
        } else {
            console.log('Unknown interaction type');
        }
    });

    rl.close();
});
