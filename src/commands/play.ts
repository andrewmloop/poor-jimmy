import {
  AudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import ytdl from "ytdl-core-discord";
import getErrorMessage from "../utils/getErrorMessage";

export const play = {
  isPlayer: true,
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play an audio track in you voice channel!")
    .addStringOption((option) => {
      return option
        .setName("url")
        .setDescription("The URL of the track you want to play")
        .setRequired(true);
    }),
  async execute(
    interaction: CommandInteraction,
    player: AudioPlayer,
  ): Promise<void> {
    const member = interaction.member;
    const me = interaction.guild?.members.me;
    const url = String(interaction.options.get("url")?.value);

    try {
      // Command handling for inappropriate use outside of voice chat
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        await interaction.editReply({
          content: "You are note in a voice channel!",
        });
        return;
      }

      if (me?.voice.channelId && member.voice.channelId != me.voice.channelId) {
        await interaction.editReply({
          content: "You are not in my voice channel!",
        });
        return;
      }

      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: member.guild.id,
        adapterCreator: member.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);
      const track = createAudioResource(
        await ytdl(url, {
          filter: "audioonly",
          dlChunkSize: 0,
        }),
        { inputType: StreamType.Opus },
      );

      if (!track)
        interaction.reply({
          content: "No track could be found!",
          ephemeral: true,
        });

      player.play(track);
    } catch (error) {
      console.log(error);
      interaction.followUp(
        "There was an error trying to execute that command: " + getErrorMessage,
      );
    }
  },
};
