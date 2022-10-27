import {
  EmbedBuilder,
  Events,
  Guild,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Command } from "../utils/Command";
import ytdl from "ytdl-core";
import spdl from "spdl-core";
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
import { Client } from "./Client";

export abstract class PlayCommand extends Command {
  public constructor(client: Client) {
    super(client);
  }

  protected async play(
    url: string,
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
  ): Promise<EmbedBuilder> {
    const messageEmbed = new EmbedBuilder().setColor(0xff0000);
    const track = await this.fetchTrack(url, member);
    if (track instanceof Error) {
      return messageEmbed.setDescription(track.message);
    }

    const serverQueue = this.addToActiveQueue(
      track,
      guild,
      voiceChannel,
      textChannel,
    );

    if (!serverQueue.isPlaying) {
      await this.playTrack(guild.id);
      messageEmbed.setColor(0x00ff00);
      return this.getNowPlayingInfo(track, messageEmbed);
    }

    return messageEmbed
      .setColor(0x00ff00)
      .setDescription(`${track.title} added to the queue!`);
  }

  /**
   * Grabs the guild's active queue and adds the passed in track
   * to the end of it's track list. It creates a default queue if
   * an active queue is not found
   */
  protected addToActiveQueue(
    track: Track,
    guild: Guild,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
  ): Queue {
    let activeQueue = this.client.activeQueueMap.get(guild.id) as Queue;

    if (activeQueue === undefined) {
      activeQueue = {
        name: "Default",
        voiceChannel: voiceChannel,
        textChannel: textChannel,
        tracks: [],
        player: null,
        playingMessage: null,
        isPlaying: false,
        isLoop: false,
      };
      this.client.activeQueueMap.set(guild.id, activeQueue);
      this.client.addQueueToList(guild.id, activeQueue);
    }

    activeQueue.tracks.push(track);
    return activeQueue;
  }

  protected getAudioPlayer(guildId: string): AudioPlayer {
    const client: Client = this.client;
    const activeQ = client.activeQueueMap.get(guildId);

    return activeQ?.player as AudioPlayer;
  }

  protected async fetchVideoInfo(url: string): Promise<ytdl.videoInfo> {
    let videoInfo = null;

    try {
      if (ytdl.validateURL(url)) {
        videoInfo = await ytdl.getInfo(url);
      } else {
        throw Error("Unable to find track!");
      }
    } catch (error) {
      console.log(error);
      throw Error("Error getting track details");
    }

    return videoInfo;
  }

  protected async fetchTrack(
    url: string,
    member: GuildMember,
  ): Promise<Track | Error> {
    if (ytdl.validateURL(url)) {
      let trackInfo: ytdl.videoInfo;

      try {
        trackInfo = await this.fetchVideoInfo(url);
      } catch (error) {
        return this.handleError(error);
      }

      if (trackInfo === null) {
        return this.handleError(`Could not find track!`);
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

      return track;
    } else {
      return this.handleError(new Error("Error fetching track"));
    }
  }

  /**
   * Plays the first track in a guild's active queue.
   */
  protected async playTrack(guildId: string): Promise<void> {
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) return;

    if (activeQueue.tracks.length === 0) {
      return this.handleEmptyQueue(guildId);
    }

    const firstTrack = activeQueue.tracks[0];
    const connection = await this.connectToChannel(activeQueue.voiceChannel);
    activeQueue.player = await this.createAudioPlayer(firstTrack);
    connection.subscribe(activeQueue.player);
    activeQueue.isPlaying = true;

    activeQueue.player.on(AudioPlayerStatus.Idle, () => {
      activeQueue.isPlaying = false;
      this.handleTrackFinish(guildId);
    });
  }

  /**
   * Creates a VoiceConnection to a passed in VoiceChannel. Once the
   * VoiceConnection is ready, returns the VoiceConnection. Destroys the
   * connection and throws an error if something goes wrong.
   */
  protected async connectToChannel(
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

  /**
   * Takes in a Track, converts the Track's url to a stream, creates
   * an AudioResource from the stream and then creates an AudioPlayer
   * for that resource to play. Returns the newly created player.
   */
  private async createAudioPlayer(track: Track): Promise<AudioPlayer> {
    const player = createAudioPlayer();

    let stream = ytdl(track.url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource);
    return await entersState(player, AudioPlayerStatus.Playing, 5_000);
  }

  /**
   * When the current track of the guild's active queue ends,
   * push the current track to the end of the list if isLoop is on,
   * and then play the next track
   */
  private handleTrackFinish(guildId: string): void {
    const activeQueue = this.client.activeQueueMap.get(guildId) as Queue;

    if (activeQueue !== null) {
      const track = activeQueue.tracks[0];
      if (activeQueue.isLoop) {
        activeQueue.tracks.push(track);
      }
      activeQueue.tracks.shift();
      this.playTrack(guildId);
    }
  }

  /**
   * Checks if the active queue is empty or if there are no
   * members in the voice chat every 5 minutes. If so, sends a message
   * and disconnects.
   */
  private handleEmptyQueue(guildId: string): void {
    const connection = getVoiceConnection(guildId);
    const activeQueue = this.client.activeQueueMap.get(guildId) as Queue;

    setTimeout(() => {
      if (
        activeQueue.tracks.length === 0 ||
        activeQueue.voiceChannel.members.size === 0
      ) {
        connection?.destroy();
        this.client.activeQueueMap.delete(guildId);
        this.client.queueListMap.delete(guildId);
        return;
      }
    }, 300_000);
  }

  /**
   * Takes in a number of seconds and formats it to a string
   * for displaying a tracks duration
   */
  protected formatDuration(seconds: number): string {
    if (seconds === 0) return "livestream";

    const date = new Date(seconds * 1000).toISOString();
    const formatted =
      seconds < 3600 ? date.substring(14, 19) : date.substring(12, 19);

    return `[${formatted}]`;
  }
}
