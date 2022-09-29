import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

export default class AddToQ extends PlayCommand {
  name = "addToQ";
  description = "Add tracks to a specified queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("queue")
        .setDescription("The queue to add to")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("url")
        .setDescription("The url of the track to add")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const member = interaction.member as GuildMember;
    const queueOption = interaction.options.get("queue")?.value;
    const urlOption = interaction.options.get("url")?.value as string;

    const queueList = this.client.queueListMap.get(guildId);

    const queueToAdd = queueList?.find((queue) => queue.name === queueOption);

    if (!queueToAdd) {
      await interaction.editReply("A queue with that name wasn't found!");
      return;
    }

    if (queueToAdd) {
      const track = await this.fetchTrack(urlOption, member);

      if (track instanceof Error) {
        interaction.editReply("Could not find track to add!");
        return;
      }

      queueToAdd.tracks.push(track);
    }
  };
}
