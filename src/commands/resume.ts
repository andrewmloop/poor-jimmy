import { AudioPlayer } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import getErrorMessage from "../utils/getErrorMessage";

export const resume = {
  isPlayer: true,

  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the currently paused track"),

  async execute(interaction: CommandInteraction, player: AudioPlayer) {
    try {
      const isPlaying = player.unpause();
      if (isPlaying) {
        await interaction.reply("Track has been resumed!");
      } else {
        await interaction.reply({
          content: "Could not resume track!",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error);
      interaction.followUp(
        `Error executing command: ${getErrorMessage(error)}`,
      );
    }
  },
};
