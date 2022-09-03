import { AudioPlayer, AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";

export default class Pause extends Command {
  name = "pause";
  description = "Pauses the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    const guildId = interaction.guildId as string;
    const serverQueue = this.client.activeQueueMap.get(guildId);
    const player = serverQueue?.player as AudioPlayer;

    if (serverQueue?.isPlaying) {
      player.pause();

      try {
        await entersState(player, AudioPlayerStatus.Paused, 5_000);
      } catch (error) {
        console.log(error);
        return;
      }

      serverQueue.isPlaying = false;
    }
  };
}
