import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to switch to one!",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    messageEmbed
      .setTitle("Current Active Queue")
      .setColor(0x00ff00)
      .setDescription(activeQueue.name);

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      messageEmbed.addFields({
        name: "Tracks",
        value: "Nothing queued!",
        inline: false,
      });

      this.handleReply(interaction, messageEmbed);
    } else {
      let replyString = "";

      tracks.forEach((track, index) => {
        replyString = replyString + this.formatListItem(track.title, index);
      });

      messageEmbed.addFields({ name: "Tracks", value: replyString });
      this.handleReply(interaction, messageEmbed);
    }
  };

  private formatListItem(title: string, index: number): string {
    return `#${index + 1}: ${title}\n`;
  }
}
