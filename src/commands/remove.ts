import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Remove extends Command {
  name = "remove";
  description = "Remove a track from the active queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addIntegerOption((option) => {
      return option
        .setName("index")
        .setDescription(
          "The index of the track in the queue. Use /list for the index",
        )
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    const tracks = activeQueue.tracks;
    const index = interaction.options.get("index")?.value as number;

    // Error handling for an empty queue and improper index input
    if (!tracks || tracks.length === 0) {
      this.handleReply(interaction, "No tracks in queue!");
      return;
    }

    if (index < 0 && index > tracks.length - 1) {
      this.handleReply(interaction, "Choose an index in range!");
      return;
    }

    if (index === 0) {
      this.handleReply(interaction, "Use /skip to remove the current track");
      return;
    }

    const removedSong = tracks.splice(index, 1)[0];

    interaction.editReply(`Removed ${removedSong.title}`);
  };
}
