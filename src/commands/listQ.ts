import { CommandInteraction, SlashCommandBuilder } from "discord.js";
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

    if (!queueList || queueList.length === 0) {
      await interaction.editReply("There are no queues currently!");
      return;
    }

    let replyString = "Queues:\n";
    queueList.forEach((queue, index) => {
      replyString =
        replyString + this.formatListItem(queue.name as string, index);
    });

    await interaction.editReply(replyString);
  };

  private formatListItem(name: string, index: number): string {
    return `#${index + 1}: ${name}\n`;
  }
}
