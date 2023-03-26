import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import { Queue } from "../entities/Queue";
import ResponseBuilder from "../entities/ResponseBuilder";

export default class Loop extends Command {
  name = "loop";
  description = "Enables/disables looping the queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;

    const message = new ResponseBuilder();

    queue.isLoop = !queue.isLoop;

    if (queue.isLoop) {
      message.setDescription(
        "Queue looping **enabled**! Use this command again to disable it.",
      );
      this.handleReply(interaction, message);
    } else {
      message.setDescription(
        "Queue looping **disabled**! Use this command again to enable it",
      );
      this.handleReply(interaction, message);
    }
  };
}
