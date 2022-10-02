import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class CurrentQ extends Command {
  name = "currentq";
  description = "Displays the current queue and it's tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const currentQ = "Current queue:\n" + activeQueue?.name + "\n\n";

    let trackList = "Tracks:\n";
    const tracks = activeQueue?.tracks;
    if (tracks && tracks.length > 0) {
      tracks.forEach((track, index) => {
        trackList = trackList + "#" + (index + 1) + ": " + track.title + "\n";
      });
    } else {
      trackList = "No tracks in this queue";
    }

    await interaction.editReply(currentQ + trackList);
  };
}
