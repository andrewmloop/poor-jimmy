import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import ResponseBuilder from "../entities/ResponseBuilder";

export default class Ping extends Command {
  name = "ping";
  description = "Replies with Pong! and this bot's latency";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const message = new ResponseBuilder().setDescription(
      this.ping(interaction.createdTimestamp),
    );

    this.handleReply(interaction, message);
  };

  private ping(startTime: number): string {
    const ping = Math.abs(startTime - Date.now());
    return `Pong! :ping_pong: Ping is **${ping} ms**`;
  }
}
