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

    let list = "Queues:\n";
    queueList?.forEach((queue, index) => {
      list = list + "#" + index + ": " + queue.name + "\n";
    });

    await interaction.editReply(list);
  };
}
