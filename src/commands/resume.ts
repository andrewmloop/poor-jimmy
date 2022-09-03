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
    const guildId = interaction.guildId as string;
    const serverQueue = this.client.activeQueueMap.get(guildId);
    const player = serverQueue?.player as AudioPlayer;

    if (serverQueue?.isPlaying === false) {
      player.unpause();

      try {
        await entersState(player, AudioPlayerStatus.Playing, 5_000);
      } catch (error) {
        console.log(error);
        return;
      }

      serverQueue.isPlaying = true;
    }
  };
}
