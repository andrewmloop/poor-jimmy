import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
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

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (activeQueue.isPlaying === true) {
      messageEmbed.setDescription("A track is already playing!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const player = activeQueue.player as AudioPlayer;
    player.unpause();

    try {
      await entersState(player, AudioPlayerStatus.Playing, 5_000);

      activeQueue.isPlaying = true;

      messageEmbed.setColor(0x00ff00).setDescription("Track **resumed**!");
      this.handleReply(interaction, messageEmbed);
    } catch (error) {
      messageEmbed.setDescription("Unable to resume track!");
      this.handleReply(interaction, messageEmbed);
    }
  };
}
