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
    const serverQueue = this.client.queueMap.get(guildId);

    const tracks = serverQueue?.tracks;
    const index = interaction.options.get("index")?.value as number;

    if (!tracks || !index || index < 0 || index > tracks?.length) {
      interaction.reply("Choose an index in range!");
      return;
    }

    const removedSong = tracks.splice(index, 1)[0];

    interaction.reply(`Removed track: ${removedSong.title}`);
  };
}
