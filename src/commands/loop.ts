import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Loop extends Command {
  name = "loop";
  description = "Enables/disables looping on the active queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    activeQueue.isLoop = !activeQueue.isLoop;

    if (activeQueue.isLoop) {
      this.handleReply(interaction, "Queue looping enabled!");
    } else {
      this.handleReply(interaction, "Queue looping disabled!");
    }
  };
}
