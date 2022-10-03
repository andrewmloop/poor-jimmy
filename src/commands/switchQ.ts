import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";
import Play from "./play";

export default class SwitchQ extends PlayCommand {
  name = "switchq";
  description = "Switch the active queue and play";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => {
      return option
        .setName("queue")
        .setDescription("The queue to swtich to")
        .setRequired(true);
    });

  execute = async (interaction: CommandInteraction): Promise<void> => {
    interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const queueList = this.client.queueListMap.get(guildId);
    const queueOption = interaction.options.get("queue")?.value;

    if (!queueList) {
      this.handleReply(interaction, "No queues found!");
      return;
    }

    if (activeQueue && activeQueue.name === queueOption) {
      this.handleReply(interaction, `${queueOption} is already active!`);
      return;
    }

    const queueToSwitchTo = queueList.find(
      (queue) => queue.name === queueOption,
    );

    if (!queueToSwitchTo) {
      this.handleReply(
        interaction,
        `Queue with name: ${queueOption} could not be found!`,
      );
      return;
    }

    // If the active queue is playing, gracefully stop
    // it before switching to a new queue and playing
    if (activeQueue?.isPlaying) {
      const player = activeQueue.player;

      if (player) {
        player.stop();
        try {
          await entersState(player, AudioPlayerStatus.Idle, 5_000);
        } catch (error) {
          this.handleReply(interaction, "Error stopping player, aborting!");
          return;
        }
      }
    }

    this.client.activeQueueMap.set(guildId, queueToSwitchTo);
    this.handleReply(
      interaction,
      `Switched to queue: ${queueToSwitchTo.name}!`,
    );

    this.playFirstTrack(guildId, this.client.activeQueueMap);
  };
}
