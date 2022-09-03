import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Remove extends Command {
  name = "remove";
  description = "Remove a track from the queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addIntegerOption((option) => {
      return option
        .setName("index")
        .setDescription(
          "The index of the track in the queue. Use /nowplaying for the index",
        )
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    const guildId = interaction.guildId as string;
    const serverQueue = this.client.activeQueueMap.get(guildId);

    await interaction.deferReply();

    const tracks = serverQueue?.tracks;
    const index = interaction.options.get("index")?.value as number;

    // Don't allow index of 0, we want to use /skip to remove the current track
    if (!tracks || !index || index < 1 || index > tracks?.length) {
      interaction.editReply("Choose an index in range!");
      return;
    }

    const removedSong = tracks.splice(index, 1)[0];

    interaction.editReply(`Removed track: ${removedSong.title}`);
  };
}
