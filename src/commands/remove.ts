import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const tracks = activeQueue.tracks;
    const index = interaction.options.get("index")?.value as number;

    // Error handling for an empty queue and improper index input
    if (!tracks || tracks.length === 0) {
      messageEmbed.setDescription("There are no tracks queued!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (index < 0 && index > tracks.length - 1) {
      messageEmbed.setDescription("Please choose an index in range!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (index === 0) {
      messageEmbed.setDescription("Use /skip to remove the current track");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const removedSong = tracks.splice(index, 1)[0];

    messageEmbed
      .setColor(0x00ff00)
      .setDescription(`Removed ${removedSong.title}`);

    this.handleReply(interaction, messageEmbed);
  };
}
