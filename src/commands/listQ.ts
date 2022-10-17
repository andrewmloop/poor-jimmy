import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../utils/Command";

export default class ListQ extends Command {
  name = "listqs";
  description = "Display a list of created queues";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queueList = this.client.queueListMap.get(guildId);

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!queueList || queueList.length === 0) {
      messageEmbed.setDescription(
        "This guild has no queues! Use /createq to make one.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    let replyString = "";
    queueList.forEach((queue, index) => {
      replyString =
        replyString + this.formatListItem(queue.name as string, index);
    });

    messageEmbed
      .setColor(0x00ff00)
      .setTitle("Queue List")
      .addFields({ name: "Queues", value: replyString });

    this.handleReply(interaction, messageEmbed);
  };

  private formatListItem(name: string, index: number): string {
    return `#${index + 1}: ${name}\n`;
  }
}
