import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';

import { run } from "./src/run.js";
import { autobuy } from "./src/bot/buy.js";
import { registerCommands, handleCommands } from "./src/commands.js";

const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

//connect the bot to the server
client.login(process.env.BOT_TOKEN);

//launch the bot
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(client);
    run(client, mySearches);
});

//listen to buy button clicks
client.on('interactionCreate', async (interaction) => {
    if (interaction.customId == 'autobuy') {
        const [sellerId, itemId] = interaction.message.embeds[0].footer.text.split('-');
        autobuy(interaction, itemId, sellerId);
    } else if (interaction.isCommand()) {
        handleCommands(interaction, mySearches);
    } else {
        console.log('Unknown interaction type');
    }
});