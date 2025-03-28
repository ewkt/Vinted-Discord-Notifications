import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../../config/channels.json');

export const data = new SlashCommandBuilder()
    .setName('new_search')
    .setDescription('Start receiving notifications for this Vinted channel.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of your new search.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('url')
            .setDescription('The URL of the Vinted product page.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('banned_keywords')
            .setDescription('Keywords to ban from the title of the search results. (separate with commas -> "keyword1, keyword2")')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('frequency')
            .setDescription('The frequency of the search in seconds. (defaults to 10s)')
            .setRequired(false));

//validate that the URL is a Vinted catalog URL with at least one query parameter
const validateUrl = (url) => {
    try {
        let route = new URL(url).pathname.split('/').pop();

        if (route !== "catalog") {
            return "invalid-url-with-example";
        }

        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        // check if the URL has at least one query parameter
        if (searchParams.toString().length === 0) {
            return "must-have-query-params"
        }

        return true;
    } catch (error) {
        return "invalid-url";
    }
}

export const execute = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const url = interaction.options.getString('url');
    const banned_keywords = interaction.options.getString('banned_keywords') ? interaction.options.getString('banned_keywords').split(',').map(keyword => keyword.trim()) : [];
    const frequency = interaction.options.getString('frequency') || 10;
    const name = interaction.options.getString('name');
    const channel_id = interaction.channel.id;

    // validate the URL
    const validation = validateUrl(url);
    if (validation !== true) {
        await interaction.followUp({ content: validation});
        return;
    }

    try {
        //register the search into the json file
        const searches = JSON.parse(fs.readFileSync(filePath));

        if (searches.some(search => search.channelName === name)) {
            await interaction.followUp({ content: 'A search with the name ' + name + ' already exists.'});
            return;
        }

        const search = {
            "channelId": channel_id,
            "channelName": name,
            "url": url,
            "frequency": frequency,
            "titleBlacklist": banned_keywords
        };
        searches.push(search);

        try{
            fs.writeFileSync(filePath, JSON.stringify(searches, null, 2));
        } catch (error) {
            console.error('Error starting monitoring:', error);
            await interaction.followUp({ content: 'There was an error starting the monitoring.'});
        }

        const embed = new EmbedBuilder()
            .setTitle("Search saved!")
            .setDescription("Monitoring for " + name + " will be started on next restart.")
            .setColor(0x00FF00);

        await interaction.followUp({ embeds: [embed]});

    } catch (error) {
        console.error('Error starting monitoring:', error);
        await interaction.followUp({ content: 'There was an error starting the monitoring.'});
    }
}
