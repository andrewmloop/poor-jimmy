import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Restart extends PlayCommand {
  name = "restart";
  description = "Restarts the currently playing track";

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

    this.playTrack(guildId);

    const reply = queue.getNowPlayingMessage();
    this.handleReply(interaction, reply);
  };
}
