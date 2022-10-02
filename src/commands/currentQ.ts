import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class CurrentQ extends Command {
  name = "currentq";
  description = "Displays the current queue and it's tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No active queue found!");
      return;
    }

    let replyString = `Name: ${activeQueue.name}\n\nTracks:\n`;

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      replyString = replyString + `Nothing queued!`;
      this.handleReply(interaction, replyString);
    } else {
      tracks.forEach((track, index) => {
        replyString = replyString + this.formatListItem(track.title, index);
      });
      this.handleReply(interaction, replyString);
    }
  };

  private formatListItem(title: string, index: number): string {
    return `#${index + 1}: ${title}\n`;
  }
}
