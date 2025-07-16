import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commands = [];
// Ensure this path is correct for where your command files are located
const commandFilesPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandFilesPath).filter(file => file.endsWith('.js'));

const loadCommands = async () => {
    for (const file of commandFiles) {
        // Adjust the import path to correctly point to the commands directory
        const module = await import(`./commands/${file}`);
        if (module.data) {
            commands.push(module.data.toJSON());
        }
    }
}

export const registerCommands = async (client) => {
    await loadCommands();
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('\nError reloading commands:', error);
    }
}

export const handleCommands = async (interaction, mySearches) => {
    console.log(`Received command: ${interaction.commandName}`);

    try {
        // Adjust the import path here as well
        const module = await import(`./commands/${interaction.commandName}.js`);
        await module.execute(interaction, mySearches);
    } catch (error) {
        console.error('\nError handling command:', error);

        const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        } catch (e) {
            console.error('Error while sending error message to Discord:', e);
        }
    }
}