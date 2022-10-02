import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skips the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const player = this.getAudioPlayer(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      this.handleReply(interaction, "There is nothing to skip!");
      return;
    }

    const current = tracks[0];

    if (activeQueue.isLoop) {
      tracks.push(current);
    }
    tracks.shift();
    this.playTrack(tracks[0], player);

    this.handleReply(interaction, "Track skipped!");
  };
}
