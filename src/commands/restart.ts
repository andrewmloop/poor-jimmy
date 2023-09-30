import {
  AudioPlayerStatus,
  entersState,
  getVoiceConnection,
} from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Restart extends PlayCommand {
  name = "restart";
  description = "Restart the currently playing track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;
    const player = queue.getPlayer();

    const message = new ResponseBuilder();

    const tracks = queue.getTracks();

    if (tracks.length === 0) {
      message.setFailure().setDescription("The queue is empty!");
      this.handleReply(interaction, message);
      return;
    }

    if (player?.state.status === AudioPlayerStatus.Playing) {
      try {
        player.pause();
        await entersState(player, AudioPlayerStatus.Paused, 5_000);
      } catch (error) {
        message
          .setFailure()
          .setDescription("Error restarting the track. Aborting!");
        this.handleReply(interaction, message);
        return;
      }
    }

    // Destroy the existing voice connection. A new connection is made
    // when a new track plays
    const currentVoiceConnection = getVoiceConnection(guildId);
    if (currentVoiceConnection) {
      currentVoiceConnection.destroy();
    }

    this.playTrack(guildId);

    message.setDescription("Track **restarted**!");
    this.handleReply(interaction, message);
  };
}
