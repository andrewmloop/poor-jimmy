import {
  CommandInteraction,
  Guild,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";

export default class Play extends PlayCommand {
  name = "play";
  description = "Add a track from a URL to the queue";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("url")
        .setDescription("The URL to play")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const url = interaction.options.get("url")?.value as string;
    const member = interaction.member as GuildMember;
    const guild = interaction.guild as Guild;

    const reply = await this.play(url, guild, member);

    this.handleReply(interaction, reply);
  };
}
