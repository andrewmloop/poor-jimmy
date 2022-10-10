import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Commands extends Command {
  name = "commands";
  description = "Displays a list of all the bot's commands";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    const commandList = this.client.commands;

    let replyString = `Commands:\n`;

    commandList.each((command, name) => {
      replyString = replyString + `${name}: ${command.description}\n`;
    });

    interaction.editReply(replyString);
  };
}
