import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../utils/Command";

export default class ListQTracks extends Command {
  name = "listqueuetracks";
  description = "Display a queue's tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("queue")
        .setDescription("The name of the queue")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queueOption = interaction.options.get("queue")?.value as string;

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    const queueList = this.client.queueListMap.get(guildId);

    if (!queueList) {
      messageEmbed.setDescription(
        "This guild has no queues! Use /createq to make one.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    let foundQueue = queueList.find((queue) => queue.name === queueOption);
    if (!foundQueue) {
      messageEmbed.setDescription(
        `No queue was found with the name: **${queueOption}**!`,
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const titles = foundQueue.tracks.map((track) => track.title);
    let replyString = "";
    titles.forEach((title, index) => {
      replyString = replyString + this.formatListItem(title, index);
    });

    messageEmbed
      .setColor(0x00ff00)
      .setTitle(foundQueue.name)
      .addFields({ name: "Tracks", value: replyString });

    this.handleReply(interaction, messageEmbed);
  };

  private formatListItem(title: string, index: number): string {
    return `#${index + 1}: ${title}\n`;
  }
}
