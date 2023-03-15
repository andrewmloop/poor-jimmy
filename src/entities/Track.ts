import { GuildMember } from "discord.js";
import ytdl from "ytdl-core";

export interface Track {
  info: ytdl.videoInfo;
  title: string;
  url: string;
  duration: number;
  formattedDuration: string;
  requestedBy: GuildMember;
}

export class Track implements Track {
  public constructor(info: ytdl.videoInfo, requestedBy: GuildMember) {
    this.info = info;
    this.title = info.videoDetails.title;
    this.url = info.videoDetails.video_url;
    this.duration = this.getTrackDuration(info);
    this.formattedDuration = this.formatTrackDuration(this.duration);
    this.requestedBy = requestedBy;
  }

  private getTrackDuration(trackInfo: ytdl.videoInfo): number {
    return parseInt(trackInfo.videoDetails.lengthSeconds);
  }

  /**
   * Takes in a number of seconds and formats it to a string
   * for displaying a tracks duration
   */
  private formatTrackDuration(seconds: number): string {
    if (seconds === 0) return "livestream";

    const date = new Date(seconds * 1000).toISOString();
    const formatted =
      seconds < 3600 ? date.substring(14, 19) : date.substring(12, 19);

    return `[${formatted}]`;
  }
}
