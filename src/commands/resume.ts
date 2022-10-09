import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Resume extends Command {
  name = "resume";
  description = "Resume the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    if (activeQueue.isPlaying === true) {
      this.handleReply(interaction, "A track is playing!");
      return;
    }

    const player = activeQueue.player as AudioPlayer;
    player.unpause();

    try {
      await entersState(player, AudioPlayerStatus.Playing, 5_000);
      this.handleReply(interaction, "Track resumed!");
    } catch (error) {
      this.handleReply(interaction, "Unable to resume track!");
      return;
    }

    activeQueue.isPlaying = true;
  };
}
