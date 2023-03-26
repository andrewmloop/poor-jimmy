import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Clear extends PlayCommand {
  name = "clear";
  description = "Remove all tracks from the queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;

    const message = new ResponseBuilder();

    if (queue.tracks.length === 0) {
      message.setFailure().setDescription("The queue is already empty!");
      this.handleReply(interaction, message);
      return;
    }

    if (queue.player?.state.status === AudioPlayerStatus.Playing) {
      try {
        queue.player.pause();
        await entersState(queue.player, AudioPlayerStatus.Paused, 5_000);
      } catch (error) {
        message
          .setFailure()
          .setDescription("Error pausing the track. Aborting!");
        this.handleReply(interaction, message);
        return;
      }
    }

    queue.clearTracks();

    message.setDescription("The queue has been **cleared**");

    this.handleReply(interaction, message);
  };
}
