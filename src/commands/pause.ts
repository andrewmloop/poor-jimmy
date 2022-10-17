import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../utils/Command";

export default class Pause extends Command {
  name = "pause";
  description = "Pause the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (activeQueue.isPlaying === false) {
      messageEmbed.setDescription("The current track is already paused!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const player = activeQueue.player as AudioPlayer;
    player.pause();

    try {
      await entersState(player, AudioPlayerStatus.Paused, 5_000);

      activeQueue.isPlaying = false;

      messageEmbed.setColor(0x00ff00).setDescription("Track paused!");
      this.handleReply(interaction, messageEmbed);
    } catch (error) {
      messageEmbed.setDescription("Unable to pause track!");
      this.handleReply(interaction, messageEmbed);
      return;
    }
  };
}
