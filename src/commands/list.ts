import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class List extends Command {
  name = "list";
  description = "Display the active queue's tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      this.handleReply(interaction, "No tracks in queue!");
      return;
    }

    let replyString = `${activeQueue.name} Queue:\nQueue looping: ${activeQueue.isLoop}\n\n`;

    const titles = tracks.map((track) => track.title);

    titles.forEach((title, index) => {
      replyString = replyString + this.formatListItem(title, index);
    });

    interaction.editReply(replyString);
  };

  private formatListItem(title: string, index: number): string {
    if (index === 0) {
      return `Current: ${title}\n`;
    } else {
      return `#${index}: ${title}\n`;
    }
  }
}
