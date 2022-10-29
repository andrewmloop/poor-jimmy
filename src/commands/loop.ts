import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../utils/Command";

export default class Loop extends Command {
  name = "loop";
  description = "Enables/disables looping on the active queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

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

    activeQueue.isLoop = !activeQueue.isLoop;

    if (activeQueue.isLoop) {
      messageEmbed
        .setColor(0x00ff00)
        .setDescription("Queue looping **enabled**!");
      this.handleReply(interaction, messageEmbed);
    } else {
      messageEmbed
        .setColor(0x00ff00)
        .setDescription("Queue looping **disabled**!");
      this.handleReply(interaction, messageEmbed);
    }
  };
}
