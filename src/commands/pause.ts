import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../entities/Command";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Pause extends Command {
  name = "pause";
  description = "Pause the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;
    const player = queue.getPlayer();

    const message = new ResponseBuilder();

    if (player.state.status === AudioPlayerStatus.Paused) {
      message
        .setFailure()
        .setDescription("The current track is already paused!");
      this.handleReply(interaction, message);
      return;
    }

    player.pause();
    try {
      await entersState(player, AudioPlayerStatus.Paused, 5_000);

      message.setDescription("Track **paused**! Use /resume to resume.");
      this.handleReply(interaction, message);
    } catch (error) {
      message.setFailure().setDescription("Unable to pause track!");
      this.handleReply(interaction, message);
      return;
    }
  };
}
