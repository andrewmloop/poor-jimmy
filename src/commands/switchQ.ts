import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";

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
    await interaction.deferReply();

    const guildId = interaction.guildId as string;
    const activeQueue = this.client.activeQueueMap.get(guildId);
    const queueList = this.client.queueListMap.get(guildId);
    const queueOption = interaction.options.get("queue")?.value;

    const messageEmbed = new EmbedBuilder().setColor(0xff0000);

    if (!queueList) {
      messageEmbed.setDescription(
        "No queues found! Use /createq to create a new queue.",
      );
      this.handleReply(interaction, messageEmbed);
      return;
    }

    if (activeQueue && activeQueue.name === queueOption) {
      messageEmbed.setDescription(`**${queueOption}** is already active!`);
      this.handleReply(interaction, messageEmbed);
      return;
    }

    const queueToSwitchTo = queueList.find(
      (queue) => queue.name === queueOption,
    );

    if (!queueToSwitchTo) {
      messageEmbed.setDescription(`**${queueOption}** could not be found!`);
      this.handleReply(interaction, messageEmbed);
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
          messageEmbed.setDescription("Error stopping player, aborting!");
          this.handleReply(interaction, messageEmbed);
          return;
        }
      }
    }

    this.client.activeQueueMap.set(guildId, queueToSwitchTo);

    messageEmbed
      .setColor(0x00ff00)
      .setDescription(`Switched to **${queueToSwitchTo.name}**!`);
    this.handleReply(interaction, messageEmbed);

    this.playTrack(guildId);
  };
}
