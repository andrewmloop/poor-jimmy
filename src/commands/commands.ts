import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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

    const commandListEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("Command List");

    commandList.each((command, name) => {
      commandListEmbed.addFields({
        name: `/${name}`,
        value: command.description,
        inline: false,
      });
    });

    interaction.editReply({
      embeds: [commandListEmbed],
    });
  };
}
