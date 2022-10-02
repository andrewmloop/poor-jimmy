import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class RemoveQ extends Command {
  name = "removeq";
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
    interaction.deferReply();

    // Grab required variables
    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const queueList = this.client.queueListMap.get(guildId);
    const option = interaction.options.get("name")?.value as string;

    // Make sure the queue to be removed is not the current queue playing
    if (activeQueue && activeQueue.name === option) {
      this.handleReply(
        interaction,
        "You can't remove the active queue. Please /switchq to another before removing",
      );
      return;
    }

    if (!queueList) {
      this.handleReply(interaction, "Unable to find queue list!");
      return;
    }

    // Remove queue
    let isSuccess = false;
    queueList.forEach((queue, index) => {
      if (queue.name === option) {
        queueList.splice(index, 1);
        isSuccess = true;
      }
    });

    // Edit reply
    if (isSuccess) {
      this.handleReply(interaction, `Successfully removed ${option}`);
    } else {
      this.handleReply(interaction, `Unable to remove ${option}`);
    }
  };
}
