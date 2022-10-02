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
    const guildId = interaction.guildId as string;
    const serverQueue = this.client.activeQueueMap.get(guildId);
    const track = serverQueue?.tracks[0];

    if (track) {
      await interaction.reply(this.getNowPlayingInfo(track));
    } else {
      await interaction.reply("There's nothing playing!");
    }
  };

  private getNowPlayingInfo(track: Track): string {
    const link = this.getFormattedLink(track);
    const requester = track.requestedBy.user.username;
    const duration = track.formattedDuration;

    return `Now Playing:\n${link}\n${duration}\nRequested by: ${requester}`;
  }
}
