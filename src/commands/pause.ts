import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Pause extends Command {
  name = "pause";
  description = "Pause the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    if (activeQueue.isPlaying === false) {
      this.handleReply(interaction, "The current track is paused!");
    }

    const player = activeQueue.player as AudioPlayer;
    player.pause();

    try {
      await entersState(player, AudioPlayerStatus.Paused, 5_000);
    } catch (error) {
      this.handleReply(interaction, "Unable to pause track!");
      return;
    }

    activeQueue.isPlaying = false;
  };
}
