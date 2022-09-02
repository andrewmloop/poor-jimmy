import { CommandInteraction, SlashCommandBuilder } from "discord.js";
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

  protected formatDuration(seconds: number): string {
    if (seconds === 0) return "livestream";

    const date = new Date(seconds * 1000).toISOString();
    return seconds < 3600 ? date.substring(14, 5) : date.substring(11, 8);
  }

  protected getFormattedLink(track: Track): string {
    return `[${track.title}] ${track.url}`;
  }

  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return error as string;
  }
}
