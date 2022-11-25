import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Track } from "../utils/Bot";
import { PlayCommand } from "../utils/PlayCommand";
import ResponseBuilder from "../utils/ResponseBuilder";

export default class Restart extends PlayCommand {
  name = "restart";
  description = "Restarts the currently playing track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    const response = new ResponseBuilder().setFailure();

    if (!activeQueue) {
      response.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, response);
      return;
    }

    const trackList = activeQueue.tracks;

    if (trackList.length === 0) {
      response.setDescription("The queue is empty!");
      this.handleReply(interaction, response);
      return;
    }

    if (activeQueue.player?.state.status === AudioPlayerStatus.Playing) {
      try {
        activeQueue.player.pause();
        await entersState(activeQueue.player, AudioPlayerStatus.Paused, 5_000);
        activeQueue.isPlaying = false;
      } catch (error) {
        response.setDescription("Error pausing the track. Aborting!");
        this.handleReply(interaction, response);
        return;
      }
    }

    const currentTrack = trackList.shift();
    trackList.unshift(currentTrack as Track);

    this.playTrack(guildId);

    response.setSuccess();
    let reply = this.getNowPlayingInfo(trackList[0], response);
    this.handleReply(interaction, reply);
  };
}
