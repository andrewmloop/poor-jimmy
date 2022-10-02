import {
  CommandInteraction,
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
        .setDescription("The name of the queue")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queueList = this.client.queueListMap.get(guildId);

    if (queueList) {
      const queueName = interaction.options.get("name")?.value;

      const member = interaction.member as GuildMember;
      const textChannel = interaction.channel as TextChannel;
      const voiceChannel = member.voice.channel as VoiceChannel;

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

      await interaction.editReply(`${queueName} queue created!`);
      return;
    }

    await interaction.editReply("Couldn't create queue!");
  };
}
