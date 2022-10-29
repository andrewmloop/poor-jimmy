import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to switch to one!",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      messageEmbed.setDescription("Nothing queued!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    messageEmbed
      .setColor(0x00ff00)
      .setTitle(activeQueue.name)
      .addFields({
        name: "Queue Looping",
        value: `${activeQueue.isLoop ? "Enabled" : "Disabled"}`,
      });

    const titles = tracks.map((track) => track.title);

    let replyString = "";
    titles.forEach((title, index) => {
      replyString = replyString + this.formatListItem(title, index);
    });

    messageEmbed.addFields({ name: "Tracks", value: replyString });

    this.handleReply(interaction, messageEmbed);
  };

  private formatListItem(title: string, index: number): string {
    if (index === 0) {
      return `Current: ${title}\n\n`;
    } else {
      return `#${index}: ${title}\n`;
    }
  }
}
