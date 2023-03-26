import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import { Queue } from "../entities/Queue";
import ResponseBuilder from "../entities/ResponseBuilder";

export default class Remove extends Command {
  name = "remove";
  description = "Remove a track from the active queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addIntegerOption((option) => {
      return option
        .setName("index")
        .setDescription(
          "The index of the track in the queue. Use /list for the index",
        )
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;

    const message = new ResponseBuilder();

    const tracks = queue.getTracks();
    const index = interaction.options.get("index")?.value as number;

    // Error handling for an empty queue and improper index input
    if (!tracks || tracks.length === 0) {
      message.setFailure().setDescription("There are no tracks queued!");
      this.handleReply(interaction, message);
      return;
    }

    if (index < 0 || index > tracks.length - 1) {
      message.setFailure().setDescription("Please choose an index in range!");
      this.handleReply(interaction, message);
      return;
    }

    if (index === 0) {
      message
        .setFailure()
        .setDescription("Use /skip to remove the current track");
      this.handleReply(interaction, message);
      return;
    }

    const removedSong = tracks.splice(index, 1)[0];

    message.setDescription(`Removed **${removedSong.title}**`);

    this.handleReply(interaction, message);
  };
}
