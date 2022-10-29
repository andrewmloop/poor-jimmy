import {
  CommandInteraction,
  EmbedBuilder,
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

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (activeQueue && activeQueue.name === queueOption) {
      messageEmbed.setDescription(
        "Please use /play to add tracks to the active queue",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const queueList = this.client.queueListMap.get(guildId);

    if (!queueList) {
      messageEmbed.setDescription(
        "No queues found! Use /createq to create a new queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const queueToAdd = queueList.find((queue) => queue.name === queueOption);

    if (!queueToAdd) {
      messageEmbed.setDescription(`${queueOption} can't be found!`);
      this.handleReply(interaction, messageEmbed);
      return;
    }

    try {
      const track = await this.fetchTrack(urlOption, member);
      if (track instanceof Error) {
        messageEmbed.setDescription(track.message);
        this.handleReply(interaction, messageEmbed);
        return;
      }
      queueToAdd.tracks.push(track);

      messageEmbed
        .setColor(0x00ff00)
        .setDescription(`**${track.title}** added to **${queueToAdd.name}**!`);

      this.handleReply(interaction, messageEmbed);
    } catch (error) {
      messageEmbed.setDescription("Unable to find track to add!");

      this.handleReply(interaction, messageEmbed);
      return;
    }
  };
}
