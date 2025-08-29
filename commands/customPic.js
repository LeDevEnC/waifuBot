const { SlashCommandBuilder , AttachmentBuilder} = require('discord.js');
const { getCustomPic } = require('../services/waifuService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom-pic')
        .setDescription('Replies with a custom picture!')
        .addStringOption(option =>
            option
                .setName('tag')
                .setDescription('The tag to search for')
                .setRequired(true) // obligatoire
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const tag = interaction.options.getString('tag'); // récupère le tag
            const waifuData = await getCustomPic(tag);

            const attachment = new AttachmentBuilder(waifuData.url, { 
                name: waifuData.filename 
            });

            await interaction.editReply({
                content: `||Voici la waifu pour ${tag}||`,
                files: [attachment]
            });

        } catch (error) {
            console.error('Error fetching custom pic:', error);
            await interaction.editReply({
                content: `Sorry, I couldn't fetch a picture for that tag.`,
            });
        }
    },
};
