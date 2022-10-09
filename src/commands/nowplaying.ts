import { CommandInteraction, SlashCommandBuilder } from "discord.js";
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

    if (!activeQueue) {
      this.handleReply(interaction, "No queue found!");
      return;
    }

    const track = activeQueue.tracks[0];

    if (track) {
      const reply = this.getNowPlayingInfo(track);
      this.handleReply(interaction, reply);
    } else {
      this.handleReply(interaction, "No track playing!");
    }
  };

  private getNowPlayingInfo(track: Track): string {
    const link = this.getFormattedLink(track);
    const requester = track.requestedBy.user.username;
    const duration = track.formattedDuration;

    return `Now Playing:\n${link}\n${duration}\nRequested by: ${requester}`;
  }
}
