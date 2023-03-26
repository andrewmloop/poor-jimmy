import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class NowPlaying extends PlayCommand {
  name = "nowplaying";
  description = "Display info about the currently playing track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;

    const message = new ResponseBuilder();

    const track = queue.getTracks()[0];

    if (track) {
      const reply = queue.getNowPlayingMessage();
      this.handleReply(interaction, reply);
    } else {
      message.setFailure().setDescription("No track playing!");
      this.handleReply(interaction, message);
    }
  };
}
