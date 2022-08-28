import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const ping = {
  isPlayer: false,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Pong! :ping_pong:");
  },
};
