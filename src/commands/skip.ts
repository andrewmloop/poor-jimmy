import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";
import ResponseBuilder from "../utils/ResponseBuilder";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skips the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const player = this.getAudioPlayer(guildId);

    const response = new ResponseBuilder().setFailure();

    if (!activeQueue) {
      response.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, response);
      return;
    }

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      response.setDescription("There is nothing to skip!");
      this.handleReply(interaction, response);
      return;
    }

    const current = tracks[0];

    if (activeQueue.isLoop) {
      tracks.push(current);
    }
    tracks.shift();

    try {
      player.pause();
      await entersState(player, AudioPlayerStatus.Paused, 5_000);

      response.setSuccess();

      if (tracks.length > 0) {
        this.playTrack(guildId);
        let reply = this.getNowPlayingInfo(tracks[0], response);
        this.handleReply(interaction, reply);
      } else {
        response.setDescription("The queue has ended");
        this.handleReply(interaction, response);
      }
    } catch (error) {
      response.setDescription("Error skipping track!");
      this.handleReply(interaction, response);
    }
  };
}
