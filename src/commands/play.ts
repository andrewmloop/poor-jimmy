import {
  CommandInteraction,
  Guild,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Command } from "../utils/Command";
import ytdl from "ytdl-core";
import { Queue, Track } from "../utils/Bot";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from "@discordjs/voice";

export default class Play extends Command {
  name = "play";
  description = "Add a track from a URL to the queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("url")
        .setDescription("The URL to play")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const url = interaction.options.get("url")?.value as string;
    const member = interaction.member as GuildMember;
    const textChannel = interaction.channel as TextChannel;
    const voiceChannel = member.voice.channel as VoiceChannel;
    const guild = interaction.guild as Guild;

    const reply = await this.play(
      url,
      textChannel,
      voiceChannel,
      guild,
      member,
    );

    interaction.editReply(reply);
  };

  private async play(
    url: string,
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
  ): Promise<string> {
    if (!voiceChannel) {
      return `You must be in a voice channel to play a track!`;
    }

    let trackInfo: ytdl.videoInfo;
    try {
      trackInfo = await this.getTrackInfo(url);
    } catch (error) {
      return this.getErrorMessage(error);
    }

    if (trackInfo === null) {
      return `Could not find track!`;
    }

    const duration = parseInt(trackInfo.videoDetails.lengthSeconds);
    const track: Track = {
      info: trackInfo,
      title: trackInfo.videoDetails.title,
      url: trackInfo.videoDetails.video_url,
      duration: duration,
      formattedDuration: this.formatDuration(duration),
      requestedBy: member,
    };

    const serverQueue = this.addToQueue(
      track,
      guild,
      voiceChannel,
      textChannel,
    );

    if (!serverQueue.isPlaying) {
      await this.playTrack(guild.id, this.client.queueMap);
      return this.getNowPlayingMessage(serverQueue);
    }

    return `${track.title} added to the queue!`;
  }

  private async getTrackInfo(url: string): Promise<ytdl.videoInfo> {
    let songInfo = null;

    if (!ytdl.validateURL(url)) {
      throw Error("Unable to find track!");
    }

    try {
      songInfo = await ytdl.getInfo(url);
    } catch (error) {
      console.log(error);
      throw Error("Error getting video from URL");
    }

    return songInfo;
  }

  private addToQueue(
    track: Track,
    guild: Guild,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
  ): Queue {
    let serverQueue: Queue = this.client.queueMap.get(guild.id) as Queue;

    if (serverQueue === undefined) {
      serverQueue = {
        voiceChannel: voiceChannel,
        textChannel: textChannel,
        tracks: [],
        player: null,
        playingMessage: null,
        isPlaying: false,
        isLoop: false,
      };
      this.client.queueMap.set(guild.id, serverQueue);
    }

    serverQueue.tracks.push(track);
    return serverQueue;
  }

  private async playTrack(
    guildId: string,
    queueMap: Map<string, Queue>,
  ): Promise<void> {
    const serverQueue = queueMap.get(guildId);

    if (!serverQueue) return;

    if (serverQueue.tracks.length === 0) {
      return this.handleEmptyQueue(guildId, queueMap, serverQueue, 60_000);
    }

    const track = serverQueue.tracks[0];
    const connection = await this.connectToChannel(serverQueue.voiceChannel);
    serverQueue.player = await this.getAudioPlayer(track);
    connection.subscribe(serverQueue.player);
    serverQueue.isPlaying = true;

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
      serverQueue.isPlaying = false;
      this.handleTrackFinish(guildId, queueMap, serverQueue);
    });
  }

  handleEmptyQueue(
    guildId: string,
    queueMap: Map<string, Queue>,
    serverQueue: Queue,
    timeoutDuration: number,
  ): void {
    const connection = getVoiceConnection(guildId);
    if (serverQueue.voiceChannel.members.size === 0) {
      connection?.destroy();
      queueMap.delete(guildId);
      return;
    }

    setTimeout(() => {
      if (serverQueue.tracks.length === 0) {
        connection?.destroy();
        queueMap.delete(guildId);
        return;
      }
    }, timeoutDuration);
  }

  private async connectToChannel(
    channel: VoiceChannel,
  ): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      connection.on("stateChange", async (_, newState) => {
        if (newState.status !== VoiceConnectionStatus.Disconnected) {
          return;
        }
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              connection,
              VoiceConnectionStatus.Connecting,
              5_000,
            );
          } catch {
            connection.destroy();
          }
        } else if (connection.rejoinAttempts < 5) {
          connection.rejoin();
        } else {
          connection.destroy();
          return;
        }
      });
      return connection;
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }

  private async getAudioPlayer(track: Track): Promise<AudioPlayer> {
    const player = createAudioPlayer();
    const stream = ytdl(track.url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
    return await entersState(player, AudioPlayerStatus.Playing, 5_000);
  }

  handleTrackFinish(
    guildId: string,
    queueMap: Map<string, Queue>,
    serverQueue: Queue,
  ): void {
    if (serverQueue != null) {
      const track = serverQueue.tracks[0];
      if (serverQueue.isLoop) {
        serverQueue.tracks.push(track);
      }
      serverQueue.tracks.shift();
      this.playTrack(guildId, queueMap);
    }
  }

  getNowPlayingMessage(serverQueue: Queue): string {
    const track = serverQueue.tracks[0];
    const link = this.getFormattedLink(track);

    return `Now playing:\n${link}`;
  }
}
