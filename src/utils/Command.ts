import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
import { Track } from "./Bot";
import { Client } from "./Client";

export abstract class Command {
  client: Client;
  abstract name: string;
  abstract description: string;
  abstract data: any;
  abstract execute: (Interaction: CommandInteraction) => Promise<void>;

  public constructor(client: Client) {
    this.client = client;
  }

  protected handleReply(interaction: CommandInteraction, embed: EmbedBuilder) {
    interaction.editReply({
      embeds: [embed],
    });
  }

  protected handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error(error as string);
    }
  }

  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return error as string;
  }

  protected getNowPlayingInfo(track: Track, embed: EmbedBuilder): EmbedBuilder {
    const thumbnailURL = track.info.videoDetails.thumbnails[0].url;
    const requester = track.requestedBy.user.username;
    const duration = track.formattedDuration;

    return embed
      .setTitle("Now Playing:")
      .setDescription(track.title)
      .setImage(thumbnailURL)
      .addFields(
        { name: "Requested by:", value: requester, inline: true },
        { name: "Duration:", value: duration, inline: true },
      );
  }
}
