import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class List extends Command {
  name = "list";
  description = "Display the queued tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const serverQueue = this.client.queueMap.get(guildId);
    const tracks = serverQueue?.tracks;

    if (!tracks) {
      interaction.editReply("There are no tracks queued!");
      return;
    }

    let list = "Queue:\n";
    const titles = tracks.map((track) => track.title);
    titles.forEach((title, index) => {
      /* 
      Exclude the first element of the list because this is the track that is playing. We want to give proper indexes for /remove to use with. Using /remove on track that is currently playing causes playback issues. This seems like the cleanest way to handle it.
      */
      if (index !== 0) {
        list = list + `#` + index + ": " + title + "\n";
      }
    });

    await interaction.editReply(list);
  };
}
