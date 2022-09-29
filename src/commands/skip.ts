import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  entersState,
  StreamType,
} from "@discordjs/voice";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Track } from "../utils/Bot";
import { Command } from "../utils/Command";
import ytdl from "ytdl-core";
import { PlayCommand } from "../utils/PlayCommand";

export default class Skip extends PlayCommand {
  name = "skip";
  description = "Skips the current track";

  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execute = async (interaction: CommandInteraction): Promise<void> => {
    const guildId = interaction.guildId as string;
    const activeQueueMap = this.client.activeQueueMap;
    const serverQueue = this.client.activeQueueMap.get(guildId);
    const player = this.getAudioPlayer(guildId);

    if (serverQueue != null) {
      const tracks = serverQueue?.tracks;

      if (!tracks || tracks.length === 0) {
        interaction.reply("There is nothing in the queue!");
        return;
      }

      // this.handleTrackFinish(guildId, activeQueueMap, serverQueue);

      const current = tracks[0];
      if (serverQueue.isLoop) {
        tracks.push(current);
      }
      tracks.shift();
      this.playTrack(tracks[0], player);
    }
  };

  // private async playTrack(track: Track, player: AudioPlayer): Promise<void> {
  //   const stream = ytdl(track.url, {
  //     filter: "audioonly",
  //     highWaterMark: 1 << 25,
  //   });
  //   const resource = createAudioResource(stream, {
  //     inputType: StreamType.Arbitrary,
  //   });
  //   player.stop();
  //   await entersState(player, AudioPlayerStatus.Idle, 5_000);
  //   player.play(resource);
  //   await entersState(player, AudioPlayerStatus.Playing, 5_000);
  // }
}
