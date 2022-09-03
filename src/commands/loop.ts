import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Loop extends Command {
  name = "loop";
  description = "Enables/disables the queue to loop";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    const guildId = interaction.guildId as string;
    const serverQueue = this.client.queueMap.get(guildId);

    await interaction.deferReply();

    if (serverQueue) {
      serverQueue.isLoop = !serverQueue.isLoop;
      if (serverQueue.isLoop) {
        await interaction.editReply("Queue looping enabled!");
        return;
      } else {
        await interaction.editReply("Queue looping disabled!");
        return;
      }
    }

    await interaction.editReply("There is nothing playing!");
  };
}
