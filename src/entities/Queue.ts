import { AudioPlayer, createAudioPlayer } from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import { Track } from "./Track";
import ResponseBuilder from "./ResponseBuilder";

export interface Queue {
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  tracks: Track[];
  player: AudioPlayer;
  isLoop: boolean;
}

export class Queue implements Queue {
  public constructor(voiceChannel: VoiceChannel, textChannel: TextChannel) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.tracks = [];
    this.player = createAudioPlayer();
    this.isLoop = false;
  }

  public getNowPlayingMessage(): ResponseBuilder {
    const currentTrack = this.tracks[0];

    if (currentTrack == null) {
      return new ResponseBuilder()
        .setFailure()
        .setDescription("There are no tracks queued!");
    }

    const thumbnailURL = currentTrack.info.videoDetails.thumbnails[0].url;
    const requester = currentTrack.requestedBy.user.username;
    const duration = currentTrack.formattedDuration;

    return new ResponseBuilder()
      .setTitle("Now Playing:")
      .setDescription(currentTrack.title)
      .setImage(thumbnailURL)
      .addFields(
        { name: "Requested by:", value: requester, inline: true },
        { name: "Duration:", value: duration, inline: true },
      );
  }

  public clearTracks(): void {
    this.tracks = [];
  }

  public getTracks(): Track[] {
    return this.tracks;
  }

  public getPlayer(): AudioPlayer {
    return this.player;
  }
}
