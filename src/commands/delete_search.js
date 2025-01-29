import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../../config/channels.json');

export const data = new SlashCommandBuilder()
    .setName('delete_search')
    .setDescription('Start receiving notifications for this Vinted channel.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of your new search.')
            .setRequired(true));

export const execute = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString('name');

    try {
        //delete the search that has 'name' as name
        const searches = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const searchIndex = searches.findIndex(search => search.channelName === name);
        if (searchIndex === -1) {
            await interaction.followUp({ content: 'No search found with the name ' + name });
            return;
        }
        searches.splice(searchIndex, 1);

        await fs.promises.writeFile(filePath, JSON.stringify(searches, null, 2));

        const embed = new EmbedBuilder()
            .setTitle("Search " + name + " deleted! It will stop being monitored on the next restart.")
            .setDescription(name)
            .setColor(0x00FF00);

        await interaction.followUp({ embeds: [embed] });

    } catch (error) {
        console.error('Error deleting the search:', error);
        await interaction.followUp({ content: 'There was an error deleting the search.'});
    }
}
