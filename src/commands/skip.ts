import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skips the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const player = this.getAudioPlayer(guildId);

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!activeQueue) {
      messageEmbed.setDescription(
        "No active queue found! Use /play or /switchq to start playing a queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const tracks = activeQueue.tracks;

    if (!tracks || tracks.length === 0) {
      messageEmbed.setDescription("There is nothing to skip!");
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const current = tracks[0];

    if (activeQueue.isLoop) {
      tracks.push(current);
    }
    tracks.shift();

    if (tracks.length > 0) {
      this.playTrack(tracks[0], player);
      messageEmbed.setColor(0x00ff00).setDescription("Track skipped!");
      this.handleReply(interaction, messageEmbed);
    } else {
      player.stop();
      try {
        await entersState(player, AudioPlayerStatus.Idle, 5_000);

        messageEmbed.setColor(0x00ff00).setDescription("The queue has ended!");
        this.handleReply(interaction, messageEmbed);
      } catch (error) {
        messageEmbed.setDescription("Error skipping track!");
        this.handleReply(interaction, messageEmbed);
      }
    }
  };
}
