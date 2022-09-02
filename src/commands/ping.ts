import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Ping extends Command {
  name = "ping";
  description = "Replies with Pong! and this bot's latency";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.reply(this.ping(interaction.createdTimestamp));
  };

  private ping(startTime: number): string {
    const ping = Date.now() - startTime;
    return `Pong! :ping_pong: Your ping is ${ping} ms`;
  }
}
