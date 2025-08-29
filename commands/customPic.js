const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getCustomPic } = require('../services/waifuService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom-pic')
        .setDescription('Replies with a custom picture!')
        .addStringOption(option =>
            option.setName('tag')
                  .setDescription('The tag to search for')
                  .setRequired(true)
                  .setAutocomplete(true)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const tag = interaction.options.getString('tag');
            const waifuData = await getCustomPic(tag);

            // Télécharger l'image et créer un AttachmentBuilder
            const response = await fetch(waifuData.url);
            const buffer = await response.arrayBuffer();
            const attachment = new AttachmentBuilder(Buffer.from(buffer), { name: waifuData.filename });

            await interaction.editReply({
                content: `Here’s a picture for **${tag}** ✨`,
                files: [attachment],
            });
        } catch (error) {
            console.error('Error fetching custom pic:', error);
            await interaction.editReply({ content: `Sorry, I couldn't fetch a picture for that tag.` });
        }
    },
};
