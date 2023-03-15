import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import { Queue } from "../entities/Queue";
import ResponseBuilder from "../entities/ResponseBuilder";

export default class List extends Command {
  name = "list";
  description = "List the queue's tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;

    const message = new ResponseBuilder();

    const tracks = queue.getTracks();

    if (!tracks || tracks.length === 0) {
      message.setDescription("Nothing queued!");
      this.handleReply(interaction, message);
      return;
    }

    message.setTitle("Queued Tracks").addFields({
      name: "Queue Looping",
      value: `${queue.isLoop ? "Enabled" : "Disabled"}`,
    });

    const titles = tracks.map((track) => track.title);

    let replyString = "";
    titles.forEach((title, index) => {
      replyString = replyString + this.formatListItem(title, index);
    });

    message.addFields({ name: "Tracks", value: replyString });

    this.handleReply(interaction, message);
  };

  private formatListItem(title: string, index: number): string {
    if (index === 0) {
      return `Currently playing: ${title}\n\n`;
    } else {
      return `#${index}: ${title}\n`;
    }
  }
}
