import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import ResponseBuilder from "../entities/ResponseBuilder";

export default class Commands extends Command {
  name = "commands";
  description = "Display a list of Poor Jimmy's commands";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    const commandList = this.client.commands;

    const message = new ResponseBuilder().setTitle("Command List");

    commandList.each((command, name) => {
      message.addFields({
        name: `/${name}`,
        value: command.description,
        inline: false,
      });
    });

    this.handleReply(interaction, message);
  };
}
