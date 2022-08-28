import { AudioPlayer } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import getErrorMessage from "../utils/getErrorMessage";

export const pause = {
  isPlayer: true,

  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the currently playing track"),

  async execute(interaction: CommandInteraction, player: AudioPlayer) {
    try {
      const isPaused = player.pause();
      if (isPaused) {
        interaction.reply("Track has been paused!");
        return;
      } else {
        interaction.reply({
          content: "Could not pause track!",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error);
      await interaction.followUp(
        `Error executing command: ${getErrorMessage(error)}`,
      );
    }
  },
};
