import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

export default class Clear extends PlayCommand {
  name = "clear";
  description = "Remove all tracks from the active queue";

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

    if (activeQueue.tracks.length === 0) {
      messageEmbed.setDescription("The queue is already empty!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (activeQueue.player?.state.status === AudioPlayerStatus.Playing) {
      try {
        activeQueue.player.pause();
        await entersState(activeQueue.player, AudioPlayerStatus.Paused, 5_000);
        activeQueue.isPlaying = false;
      } catch (error) {
        messageEmbed.setDescription("Error pausing the track. Aborting!");
        this.handleReply(interaction, messageEmbed);
        return;
      }
    }

    activeQueue.tracks = [];

    messageEmbed
      .setColor(0x00ff00)
      .setDescription("The queue has been **cleared**");

    this.handleReply(interaction, messageEmbed);
  };
}
