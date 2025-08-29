const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron'); 
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, AttachmentBuilder } = require('discord.js');
const { token, autoChannelId } = require('./config.json');
const { getLastPic } = require('./services/waifuService.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Fonction pour envoyer une image automatiquement
async function sendAutoPic() {
    try {
        const channel = client.channels.cache.get(autoChannelId);
        if (!channel) {
            console.error('Canal introuvable pour l\'envoi automatique');
            return;
        }

        const waifuData = await getLastPic();

        const attachment = new AttachmentBuilder(waifuData.url, { 
            name: waifuData.filename 
        });

        await channel.send({
            files: [attachment]
        });
        
        console.log(`Image automatique envoyée à ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi automatique:', error);
    }
}

// Event handlers
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ 
                content: 'There was an error while executing this command!', 
                flags: MessageFlags.Ephemeral 
            });
        } else {
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    
    // Programmation avec cron : toutes les heures à la minute 0
    // '0 * * * *' = à chaque heure pile (XX:00)
    cron.schedule('0 * * * *', () => {
        console.log('Envoi automatique programmé déclenché');
        sendAutoPic();
    }, {
        timezone: "Europe/Paris" 
    });
    
    console.log('Planificateur automatique activé - envoi toutes les heures à XX:00');
    
});

client.login(token);