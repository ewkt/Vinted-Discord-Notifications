import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

//load commad modules
const loadCommands = async() => {
    for (const file of commandFiles) {
        const module = await import(`./commands/${file}`);
        commands.push(module.data.toJSON());
    }
}

//register commands with Discord to (refreshes them if necessary)
export const registerCommands = async (client, config) => {
    await loadCommands();

    const rest = new REST({ version: '10' }).setToken(config.bot_token);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error reloading commands:', error);
    }
}

//handle command interactions
export const handleCommands = async (interaction) => {
    console.log(`Received command: ${interaction.commandName}`);

    try {   
        const module = await import(`./commands/${interaction.commandName}.js`);
        await module.execute(interaction);
    } catch (error) {
        console.error('Error handling command:', error);
        await interaction.followUp({ content: 'There was an error while executing this command!' });
    }
}