import { AudioPlayer } from "@discordjs/voice";
import {
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import getErrorMessage from "../utils/getErrorMessage";

export const nowPlaying = {
  isPlayer: true,

  data: new SlashCommandBuilder()
    .setName("now-playing")
    .setDescription("Displays info about the currently playing track"),

  async execute(interaction: CommandInteraction, player: AudioPlayer) {
    try {
    } catch (error) {
      console.log(error);
      await interaction.followUp(
        `Error executing command: ${getErrorMessage(error)}`,
      );
    }
  },
};
