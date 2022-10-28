"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const PlayCommand_1 = require("../utils/PlayCommand");
class Play extends PlayCommand_1.PlayCommand {
    constructor() {
        super(...arguments);
        this.name = "play";
        this.description = "Add a track from a URL to the queue";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("url")
                .setDescription("The URL to play")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            const url = (_a = interaction.options.get("url")) === null || _a === void 0 ? void 0 : _a.value;
            const member = interaction.member;
            const textChannel = interaction.channel;
            const voiceChannel = member.voice.channel;
            const guild = interaction.guild;
            const reply = yield this.play(url, textChannel, voiceChannel, guild, member);
            this.handleReply(interaction, reply);
        });
        // protected async play(
        //   url: string,
        //   textChannel: TextChannel,
        //   voiceChannel: VoiceChannel,
        //   guild: Guild,
        //   member: GuildMember,
        // ): Promise<string> {
        //   if (!voiceChannel) {
        //     return `You must be in a voice channel to play a track!`;
        //   }
        //   // let trackInfo: ytdl.videoInfo;
        //   // try {
        //   //   trackInfo = await this.fetchTrackInfo(url);
        //   // } catch (error) {
        //   //   return this.getErrorMessage(error);
        //   // }
        //   // if (trackInfo === null) {
        //   //   return `Could not find track!`;
        //   // }
        //   // const duration = parseInt(trackInfo.videoDetails.lengthSeconds);
        //   // const track: Track = {
        //   //   info: trackInfo,
        //   //   title: trackInfo.videoDetails.title,
        //   //   url: trackInfo.videoDetails.video_url,
        //   //   duration: duration,
        //   //   formattedDuration: this.formatDuration(duration),
        //   //   requestedBy: member,
        //   // };
        //   const track = await this.fetchTrack(url, member);
        //   if (track instanceof Error) return track.message;
        //   const serverQueue = this.addToQueue(
        //     track,
        //     guild,
        //     voiceChannel,
        //     textChannel,
        //   );
        //   if (!serverQueue.isPlaying) {
        //     await this.playFirstTrack(guild.id, this.client.activeQueueMap);
        //     return this.getNowPlayingMessage(serverQueue);
        //   }
        //   return `${track.title} added to the queue!`;
        // }
        // private async fetchTrackInfo(url: string): Promise<ytdl.videoInfo> {
        //   let songInfo = null;
        //   if (!ytdl.validateURL(url)) {
        //     throw Error("Unable to find track!");
        //   }
        //   try {
        //     songInfo = await ytdl.getInfo(url);
        //   } catch (error) {
        //     console.log(error);
        //     throw Error("Error getting video from URL");
        //   }
        //   return songInfo;
        // }
        // private addToQueue(
        //   track: Track,
        //   guild: Guild,
        //   voiceChannel: VoiceChannel,
        //   textChannel: TextChannel,
        // ): Queue {
        //   let serverQueue: Queue = this.client.activeQueueMap.get(guild.id) as Queue;
        //   if (serverQueue === undefined) {
        //     serverQueue = {
        //       name: "Default",
        //       voiceChannel: voiceChannel,
        //       textChannel: textChannel,
        //       tracks: [],
        //       player: null,
        //       playingMessage: null,
        //       isPlaying: false,
        //       isLoop: false,
        //     };
        //     this.client.activeQueueMap.set(guild.id, serverQueue);
        //     this.client.addQueueToList(guild.id, serverQueue);
        //   }
        //   serverQueue.tracks.push(track);
        //   return serverQueue;
        // }
        // private async playFirstTrack(
        //   guildId: string,
        //   queueMap: Map<string, Queue>,
        // ): Promise<void> {
        //   const serverQueue = queueMap.get(guildId);
        //   if (!serverQueue) return;
        //   if (serverQueue.tracks.length === 0) {
        //     return this.handleEmptyQueue(guildId, queueMap, serverQueue, 60_000);
        //   }
        //   const track = serverQueue.tracks[0];
        //   const connection = await this.connectToChannel(serverQueue.voiceChannel);
        //   serverQueue.player = await this.createAudioPlayer(track);
        //   connection.subscribe(serverQueue.player);
        //   serverQueue.isPlaying = true;
        //   serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        //     serverQueue.isPlaying = false;
        //     this.handleTrackFinish(guildId, queueMap, serverQueue);
        //   });
        // }
        // handleEmptyQueue(
        //   guildId: string,
        //   queueMap: Map<string, Queue>,
        //   serverQueue: Queue,
        //   timeoutDuration: number,
        // ): void {
        //   const connection = getVoiceConnection(guildId);
        //   if (serverQueue.voiceChannel.members.size === 0) {
        //     connection?.destroy();
        //     queueMap.delete(guildId);
        //     return;
        //   }
        //   setTimeout(() => {
        //     if (serverQueue.tracks.length === 0) {
        //       connection?.destroy();
        //       queueMap.delete(guildId);
        //       return;
        //     }
        //   }, timeoutDuration);
        // }
        // private async connectToChannel(
        //   channel: VoiceChannel,
        // ): Promise<VoiceConnection> {
        //   const connection = joinVoiceChannel({
        //     channelId: channel.id,
        //     guildId: channel.guildId,
        //     adapterCreator: channel.guild.voiceAdapterCreator,
        //   });
        //   try {
        //     await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        //     connection.on("stateChange", async (_, newState) => {
        //       if (newState.status !== VoiceConnectionStatus.Disconnected) {
        //         return;
        //       }
        //       if (
        //         newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
        //         newState.closeCode === 4014
        //       ) {
        //         try {
        //           await entersState(
        //             connection,
        //             VoiceConnectionStatus.Connecting,
        //             5_000,
        //           );
        //         } catch {
        //           connection.destroy();
        //         }
        //       } else if (connection.rejoinAttempts < 5) {
        //         connection.rejoin();
        //       } else {
        //         connection.destroy();
        //         return;
        //       }
        //     });
        //     return connection;
        //   } catch (error) {
        //     connection.destroy();
        //     throw error;
        //   }
        // }
        // private async createAudioPlayer(track: Track): Promise<AudioPlayer> {
        //   const player = createAudioPlayer();
        //   let stream: any;
        //   if (spdl.validateURL(track.url)) {
        //     stream = spdl(track.url, {
        //       filter: "audioonly",
        //     });
        //   } else {
        //     stream = ytdl(track.url, {
        //       filter: "audioonly",
        //       highWaterMark: 1 << 25,
        //     });
        //   }
        //   const resource = createAudioResource(stream, {
        //     inputType: StreamType.Arbitrary,
        //   });
        //   player.play(resource);
        //   return await entersState(player, AudioPlayerStatus.Playing, 5_000);
        // }
        // handleTrackFinish(
        //   guildId: string,
        //   queueMap: Map<string, Queue>,
        //   serverQueue: Queue,
        // ): void {
        //   if (serverQueue != null) {
        //     const track = serverQueue.tracks[0];
        //     if (serverQueue.isLoop) {
        //       serverQueue.tracks.push(track);
        //     }
        //     serverQueue.tracks.shift();
        //     this.playFirstTrack(guildId, queueMap);
        //   }
        // }
        // getNowPlayingMessage(serverQueue: Queue): string {
        //   const track = serverQueue.tracks[0];
        //   const link = this.getFormattedLink(track);
        //   return `Now playing:\n${link}`;
        // }
    }
}
exports.default = Play;
