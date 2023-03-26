import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skips the current track";

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

    if (!tracks || tracks.length === 0) {
      message.setFailure().setDescription("There is nothing to skip!");
      this.handleReply(interaction, message);
      return;
    }

    const currentTrack = tracks[0];

    if (queue.isLoop) {
      tracks.push(currentTrack);
    }
    tracks.shift();

    try {
      player.pause();
      await entersState(player, AudioPlayerStatus.Paused, 5_000);

      if (tracks.length > 0) {
        this.playTrack(guildId);
        const reply = queue.getNowPlayingMessage();
        this.handleReply(interaction, reply);
      } else {
        message.setDescription("The queue has ended!");
        this.handleReply(interaction, message);
      }
    } catch (error) {
      message.setFailure().setDescription("Error skipping track!");
      this.handleReply(interaction, message);
    }
  };
}
