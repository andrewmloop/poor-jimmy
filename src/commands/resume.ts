import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Resume extends Command {
  name = "resume";
  description = "Resume the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;
    const player = queue.getPlayer();

    const message = new ResponseBuilder();

    if (player.state.status === AudioPlayerStatus.Playing) {
      message.setFailure().setDescription("A track is already playing!");
      this.handleReply(interaction, message);
      return;
    }

    player.unpause();

    try {
      await entersState(player, AudioPlayerStatus.Playing, 5_000);

      message.setDescription("Track **resumed**!");
      this.handleReply(interaction, message);
    } catch (error) {
      message.setFailure().setDescription("Unable to resume track!");
      this.handleReply(interaction, message);
    }
  };
}
