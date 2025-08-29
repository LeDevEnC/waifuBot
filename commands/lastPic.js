const { SlashCommandBuilder } = require('discord.js');
const { getLastPic } = require('../services/waifuService.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('last-pic')
		.setDescription('Replies with the last picture!'),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			const waifuData = await getLastPic();

			await interaction.editReply({
                files: [waifuData.url]
            });

		} catch (error) {
            console.error('Error fetching waifu:', error);
            await interaction.editReply({
                content: 'Sorry, I couldn\'t fetch a waifu right now. Try again later!',
            });
        }
	},
};
