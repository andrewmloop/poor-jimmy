import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../entities/PlayCommand";
import ResponseBuilder from "../entities/ResponseBuilder";
import { Queue } from "../entities/Queue";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skip the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const queue = this.client.queueMap.get(guildId) as Queue;
    const player = queue.getPlayer();

    const message = new ResponseBuilder();

    const tracks = queue.getTracks();

    if (!tracks || tracks.length === 0) {
      message.setFailure().setDescription("There is nothing to skip!");
      this.handleReply(interaction, message);
      return;
    }

    // Stopping the player and putting it into and Idle state
    // fires the "handleTrackFinish" behavior set when the track
    // was first created. This behavior removes the current track
    // from the queue and pushes it to the end if looping is enabled.
    // The next track in the queue is then started.
    try {
      player.stop(true);
      await entersState(player, AudioPlayerStatus.Idle, 5_000);
      message.setDescription("Track **skipped**!");
      this.handleReply(interaction, message);
    } catch (error) {
      message.setFailure().setDescription("Error skipping track!");
      this.handleReply(interaction, message);
    }
  };
}
