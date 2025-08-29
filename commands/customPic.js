const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getCustomPic } = require('../services/waifuService.js');
const { parseStringPromise } = require('xml2js');

/**
 * Récupère une liste de tags correspondant au texte saisi
 */
async function fetchTags(prefix) {
    if (!prefix) return [];
    const response = await fetch(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(prefix)}&limit=10`);
    if (!response.ok) return [];

    const xml = await response.text();
    const result = await parseStringPromise(xml);
    if (!result.posts || !result.posts.post) return [];

    const allTags = result.posts.post.flatMap(post => post.$.tags.split(' '));
    const uniqueTags = [...new Set(allTags)];

    // Ne renvoie que ceux qui commencent par le prefix, max 25 pour Discord
    return uniqueTags.filter(tag => tag.startsWith(prefix)).slice(0, 25);
}

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

    // Fonction d'autocomplete
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = await fetchTags(focusedValue);

        await interaction.respond(
            choices.map(tag => ({ name: tag, value: tag }))
        );
    },

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const tag = interaction.options.getString('tag');
            const waifuData = await getCustomPic(tag);

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
