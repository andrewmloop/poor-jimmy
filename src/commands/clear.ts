import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
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

    queue.clearTracks();

    const player = queue.getPlayer() as AudioPlayer;

    if (
      player.state.status === AudioPlayerStatus.Playing ||
      player.state.status === AudioPlayerStatus.Paused
    ) {
      try {
        player.stop();
        await entersState(player, AudioPlayerStatus.Idle, 5_000);
      } catch (error) {
        console.log(error);
        message
          .setFailure()
          .setDescription("Error pausing the track. Aborting!");
        this.handleReply(interaction, message);
        return;
      }
    }

    message.setDescription("The queue has been **cleared**");

    this.handleReply(interaction, message);
  };
}
