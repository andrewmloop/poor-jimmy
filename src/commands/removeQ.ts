import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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
    await interaction.deferReply();

    // Grab required variables
    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const queueList = this.client.queueListMap.get(guildId);
    const option = interaction.options.get("name")?.value as string;

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    // Make sure the queue to be removed is not the current queue playing
    if (activeQueue && activeQueue.name === option) {
      messageEmbed.setDescription(
        "You can't remove the active queue. Please /switchq to another before removing!",
      );

      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (!queueList || queueList.length === 0) {
      messageEmbed.setDescription(
        "This guild has no queues! Use /createq to make one.",
      );
      this.handleReply(interaction, messageEmbed);
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
      messageEmbed
        .setColor(0x00ff00)
        .setDescription(`Successfully removed ${option}`);
      this.handleReply(interaction, messageEmbed);
    } else {
      messageEmbed.setDescription(`Unable to find ${option}`);
      this.handleReply(interaction, messageEmbed);
    }
  };
}
