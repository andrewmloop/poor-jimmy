import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
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
}
