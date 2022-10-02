import { Guild, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { Command } from "../utils/Command";
import ytdl from "ytdl-core";
import spdl from "spdl-core";
import { Queue, Track } from "../utils/Bot";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  entersState,
  StreamType,
} from "@discordjs/voice";
import { Client } from "./Client";

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
        songInfo = await spdl.getInfo(url);
      } else if (ytdl.validateURL(url)) {
        songInfo = await ytdl.getInfo(url);
      } else {
        throw Error("Unable to find track!");
      }
    } catch (error) {
      console.log(error);
      throw Error("Error getting info from URL");
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
    } else {
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
    }
  }

  protected async playTrack(track: Track, player: AudioPlayer): Promise<void> {
    if (track.spInfo !== null) {
      const stream = await spdl(track.url, {
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
}
