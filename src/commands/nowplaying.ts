import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Track } from "../utils/Bot";
import { PlayCommand } from "../utils/PlayCommand";

export default class NowPlaying extends PlayCommand {
  name = "nowplaying";
  description = "Display info about the currently playing track";

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

    const track = activeQueue.tracks[0];

    if (track) {
      messageEmbed.setColor(0x00ff00);
      const reply = this.getNowPlayingInfo(track, messageEmbed);
      this.handleReply(interaction, reply);
    } else {
      messageEmbed.setDescription("No track playing!");
      this.handleReply(interaction, messageEmbed);
    }
  };
}
