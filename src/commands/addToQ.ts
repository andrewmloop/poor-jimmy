import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class AddToQ extends Command {
  name = "addToQ";
  description = "Add tracks to a specified queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("queue")
        .setDescription("The queue to add to")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("url")
        .setDescription("The url of the track to add")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string as string;
    const queueOption = interaction.options.get("queue")?.value;
    const urlOption = interaction.options.get("url")?.value;

    const queueList = this.client.queueListMap.get(guildId);

    if (!queueList) {
      await interaction.editReply("A queue with that name wasn't found!");
      return;
    }
    const queueToAdd = queueList?.find((queue) => queue.name === queueOption);

    if (queueToAdd) {
      queueToAdd.tracks.push(urlOption);
    }
  };
}
