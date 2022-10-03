import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

export default class AddToQ extends PlayCommand {
  name = "addtoq";
  description = "Add tracks to a specific queue";

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
        .setDescription("The URL of the track to add")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const member = interaction.member as GuildMember;
    const queueOption = interaction.options.get("queue")?.value;
    const urlOption = interaction.options.get("url")?.value as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (activeQueue && activeQueue.name === queueOption) {
      this.handleReply(
        interaction,
        "Please use /play to add tracks to the active queue",
      );
      return;
    }

    const queueList = this.client.queueListMap.get(guildId);

    if (!queueList) {
      this.handleReply(interaction, "No queues found!");
      return;
    }

    const queueToAdd = queueList.find((queue) => queue.name === queueOption);

    if (!queueToAdd) {
      this.handleReply(interaction, `Queue: ${queueOption} can't be found!`);
      return;
    }

    try {
      const track = await this.fetchTrack(urlOption, member);
      if (track instanceof Error) {
        this.handleReply(interaction, track.message);
        return;
      }
      queueToAdd.tracks.push(track);

      this.handleReply(
        interaction,
        `Track: ${track.title} added to queue: ${queueToAdd.name}`,
      );
    } catch (error) {
      this.handleReply(interaction, "Unable to find track to add!");
      return;
    }
  };
}
