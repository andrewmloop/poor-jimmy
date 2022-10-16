import {
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Queue } from "../utils/Bot";
import { Command } from "../utils/Command";

export default class CreateQ extends Command {
  name = "createq";
  description = "Create a queue that can hold it's own list of tracks";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("name")
        .setDescription("The name of the queue to be created")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queueList = this.client.queueListMap.get(guildId);

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (queueList) {
      const queueName = interaction.options.get("name")?.value;

      const member = interaction.member as GuildMember;
      const textChannel = interaction.channel as TextChannel;
      const voiceChannel = member.voice.channel as VoiceChannel;

      if (queueList?.some((queue) => queue.name === queueName)) {
        messageEmbed.setDescription("A queue with that name already exists!");
        this.handleReply(interaction, messageEmbed);
        return;
      }

      const newQueue: Queue = {
        name: queueName as string,
        voiceChannel: voiceChannel,
        textChannel: textChannel,
        tracks: [],
        player: null,
        playingMessage: null,
        isPlaying: false,
        isLoop: false,
      };

      this.client.addQueueToList(guildId, newQueue);

      messageEmbed
        .setColor(0x00ff00)
        .setDescription(`${queueName} queue created!`);

      this.handleReply(interaction, messageEmbed);
    } else {
      messageEmbed.setDescription("Error creating queue!");
      this.handleReply(interaction, messageEmbed);
    }
  };
}
