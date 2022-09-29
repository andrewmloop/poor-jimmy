import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class RemoveQ extends Command {
  name = "removeQ";
  description = "Remove an existing queue from your list of available queues";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("name")
        .setDescription("The name of the queue to be removed")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    // Defer reply
    interaction.deferReply();

    // Grab required variables
    const guildId = interaction.guildId as string;
    const client = this.client;
    const activeQ = client.activeQueueMap.get(guildId);
    const option = interaction.options.get("name")?.value as string;

    // Make sure the Q to be removed is not the current queue playing
    if (activeQ?.name === option) {
      interaction.editReply(
        "You can't remove the active queue. Please switch to another before removing.",
      );
      return;
    }

    // Remove queue
    if (activeQ) {
      const isSuccess = client.activeQueueMap.delete(option);

      // Edit reply
      if (isSuccess) {
        interaction.editReply(`Successfully removed ${option}`);
      } else {
        interaction.editReply(`Error removing ${option}`);
      }
    }

    return;
  };
}
