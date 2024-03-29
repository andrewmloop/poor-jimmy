import "dotenv/config";
import { Guild, GuildMember, VoiceChannel } from "discord.js";
import { Command } from "./Command";
import { Track } from "./Track";
import { Queue } from "./Queue";
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
import ResponseBuilder from "./ResponseBuilder";
import ytdl from "ytdl-core";
import ytSearch from "yt-search";
import { SpotifyClient } from "./SpotifyClient";

export abstract class PlayCommand extends Command {
  public constructor(client: Client) {
    super(client);
  }

  protected async play(
    url: string,
    guild: Guild,
    member: GuildMember,
  ): Promise<ResponseBuilder> {
    const message = new ResponseBuilder();
    let track: Track | Error;

    if (this.isSpotifyURL(url)) {
      const spotifyApi = new SpotifyClient();
      await spotifyApi.grantSpotifyAPIAccess();
      const searchString = await spotifyApi.getSpotifyTrackTitleAndArtist(url);

      if (searchString instanceof Error) {
        message.setFailure().setDescription(searchString.message);
        return message;
      }

      const foundUrl = await this.searchYoutube(searchString);

      if (foundUrl instanceof Error) {
        message.setFailure().setDescription(foundUrl.message);
        return message;
      }

      track = await this.fetchTrack(foundUrl, member);
    } else {
      track = await this.fetchTrack(url, member);
    }

    if (track instanceof Error) {
      return message.setFailure().setDescription(track.message);
    }

    const serverQueue = this.addToQueue(track, guild);
    const player = serverQueue.getPlayer();

    if (player?.state.status === AudioPlayerStatus.Idle) {
      await this.playTrack(guild.id);
    }

    return message.setDescription(`**${track.title}** added to the queue!`);
  }

  /**
   * Grabs the guild's active queue and adds the passed in track
   * to the end of it's track list. It creates a default queue if
   * an active queue is not found
   */
  protected addToQueue(track: Track, guild: Guild): Queue {
    const queue = this.client.queueMap.get(guild.id) as Queue;

    queue.addTrack(track);
    return queue;
  }

  protected getAudioPlayer(guildId: string): AudioPlayer {
    const queue = this.client.queueMap.get(guildId);

    return queue?.getPlayer() as AudioPlayer;
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

      const track = new Track(trackInfo, member);

      return track;
    } else {
      return this.handleError(new Error("Error fetching track"));
    }
  }

  /**
   * Plays the first track in a guild's active queue.
   */
  protected async playTrack(guildId: string): Promise<void> {
    const queue = this.client.queueMap.get(guildId);

    if (!queue || queue.getTracks().length === 0) return;

    // Clear out the timeout function if one exists
    if (this.client.timeOutMap.has(guildId)) {
      clearTimeout(this.client.timeOutMap.get(guildId));
      this.client.timeOutMap.delete(guildId);
    }

    const firstTrack = queue.getTracks()[0];
    const connection = await this.connectToChannel(queue.voiceChannel);

    queue.player = await this.createAudioPlayer(firstTrack);
    connection.subscribe(queue.player);

    queue.textChannel.send({
      embeds: [queue.getNowPlayingMessage()],
    });

    queue.player.on(AudioPlayerStatus.Idle, () => {
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
    const queue = this.client.queueMap.get(guildId) as Queue;

    if (!queue || queue.getTracks().length === 0) return;

    const tracks = queue.getTracks();
    const currentTrack = tracks[0];

    if (queue.isLoop) {
      queue.addTrack(currentTrack);
    }

    queue.removeFirstTrack();

    if (queue.getTracks().length === 0) {
      const endQueueMessage = new ResponseBuilder().setDescription(
        "The queue has ended!",
      );

      queue.textChannel.send({ embeds: [endQueueMessage] });

      // We don't want the bot to leave the guild immediately when the
      // queue ends. Create a timeout function and save it on the client. If
      // another track is played, it will clear the timeout function.
      const leaveServerTimeOut = setTimeout(() => {
        const leaveServerMessage = new ResponseBuilder().setDescription(
          "Queue has been empty for 5 minutes. Nap time for Poor Jimmy.",
        );

        queue.textChannel.send({ embeds: [leaveServerMessage] });

        this.destroyVoiceChannel(guildId);
      }, 300_000);

      this.client.timeOutMap.set(guildId, leaveServerTimeOut);
    } else {
      this.destroyVoiceChannel(guildId);

      this.playTrack(guildId);
    }
  }

  /**
   * Checks whether the passed in url is an "open.spotify.com/track" url
   */
  private isSpotifyURL(url: string): boolean {
    return url.includes("open.spotify.com/track");
  }

  /**
   * Searches for a Youtube video with the given search string and
   * returns the URL. Returns Error elsewise.
   */
  private async searchYoutube(searchString: string): Promise<string | Error> {
    let foundUrl = "";

    await ytSearch(searchString)
      .then((res) => {
        foundUrl = res.videos[0].url;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error();
        error.message = "Error searching Youtube!";
        return error;
      });

    return foundUrl;
  }

  /**
   * Destroy a guild's voice connection. A new connection is made when a new
   * track is played. This prevents memory leaks.
   *
   * @param guildId The guild's id
   */
  protected destroyVoiceChannel(guildId: string): void {
    const currentVoiceConnection = getVoiceConnection(guildId);

    if (currentVoiceConnection) {
      currentVoiceConnection.destroy();
    }
  }
}
