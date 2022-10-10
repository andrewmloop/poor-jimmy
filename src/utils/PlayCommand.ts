import { Guild, GuildMember, TextChannel, VoiceChannel } from "discord.js";
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

/**
 * This class is a mess and needs refactoring. A lot of this logic
 * was ripped from the /play command because other commands need
 * access to the logic to gracefully start and stop the player
 * as tracks/queues are manipulated
 */
export abstract class PlayCommand extends Command {
  public constructor(client: Client) {
    super(client);
  }

  protected formatDuration(seconds: number): string {
    if (seconds === 0) return "livestream";

    const date = new Date(seconds * 1000).toISOString();
    const formatted =
      seconds < 3600 ? date.substring(14, 19) : date.substring(12, 19);

    return `[${formatted}]`;
  }

  protected getFormattedLink(track: Track): string {
    return `${track.title}\n(${track.url})`;
  }

  protected async play(
    url: string,
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
  ): Promise<string> {
    const track = await this.fetchTrack(url, member);
    if (track instanceof Error) return track.message;

    const serverQueue = this.addToQueue(
      track,
      guild,
      voiceChannel,
      textChannel,
    );

    if (!serverQueue.isPlaying) {
      await this.playFirstTrack(guild.id, this.client.activeQueueMap);
      return this.getNowPlayingMessage(serverQueue);
    }

    return `${track.title} added to the queue!`;
  }

  protected addToQueue(
    track: Track,
    guild: Guild,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
  ): Queue {
    let activeQueue: Queue = this.client.activeQueueMap.get(guild.id) as Queue;

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

  protected async fetchTrackInfo(
    url: string,
  ): Promise<ytdl.videoInfo | spdl.trackInfo> {
    let songInfo = null;

    try {
      if (spdl.validateURL(url)) {
        console.log("HERE");
        songInfo = await spdl.getInfo(url);
        console.log(songInfo);
      } else if (ytdl.validateURL(url)) {
        songInfo = await ytdl.getInfo(url);
      } else {
        throw Error("Unable to find track!");
      }
    } catch (error) {
      console.log(error);
      throw Error("Error getting track details");
    }

    return songInfo;
  }

  protected async fetchTrack(
    url: string,
    member: GuildMember,
  ): Promise<Track | Error> {
    if (spdl.validateURL(url)) {
      let trackInfo: spdl.trackInfo;

      try {
        trackInfo = (await this.fetchTrackInfo(url)) as spdl.trackInfo;
      } catch (error) {
        return this.handleError(error);
      }

      if (trackInfo === null) {
        return this.handleError(`Could not find track!`);
      }

      const duration = trackInfo.duration as number;
      const track: Track = {
        ytInfo: null,
        spInfo: trackInfo,
        title: trackInfo.title,
        url: trackInfo.url,
        duration: duration,
        formattedDuration: this.formatDuration(duration),
        requestedBy: member,
      };

      return track;
    } else if (ytdl.validateURL(url)) {
      let trackInfo: ytdl.videoInfo;

      try {
        trackInfo = (await this.fetchTrackInfo(url)) as ytdl.videoInfo;
      } catch (error) {
        return this.handleError(error);
      }

      if (trackInfo === null) {
        return this.handleError(`Could not find track!`);
      }

      const duration = parseInt(trackInfo.videoDetails.lengthSeconds);
      const track: Track = {
        ytInfo: trackInfo,
        spInfo: null,
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

  protected async playTrack(track: Track, player: AudioPlayer): Promise<void> {
    if (track.spInfo !== null) {
      const stream = await spdl(track.url, {
        filter: "audioonly",
      });

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });

      player.stop();
      await entersState(player, AudioPlayerStatus.Idle, 5_000);

      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing, 5_000);
    } else {
      const stream = ytdl(track.url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
      });

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });

      player.stop();
      await entersState(player, AudioPlayerStatus.Idle, 5_000);

      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing, 5_000);
    }
  }

  protected async playFirstTrack(
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
    serverQueue.player = await this.createAudioPlayer(track);
    connection.subscribe(serverQueue.player);
    serverQueue.isPlaying = true;

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
      serverQueue.isPlaying = false;
      this.handleTrackFinish(guildId, queueMap, serverQueue);
    });
  }

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

  private async createAudioPlayer(track: Track): Promise<AudioPlayer> {
    const player = createAudioPlayer();
    let stream: any;
    if (spdl.validateURL(track.url)) {
      stream = spdl(track.url, {
        filter: "audioonly",
      });
    } else {
      stream = ytdl(track.url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
      });
    }
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
    return await entersState(player, AudioPlayerStatus.Playing, 5_000);
  }

  private handleTrackFinish(
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
      this.playFirstTrack(guildId, queueMap);
    }
  }

  private handleEmptyQueue(
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

  protected getNowPlayingMessage(serverQueue: Queue): string {
    const track = serverQueue.tracks[0];
    const link = this.getFormattedLink(track);

    return `Now playing:\n${link}`;
  }
}
