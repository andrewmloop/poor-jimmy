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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../utils/Command");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const voice_1 = require("@discordjs/voice");
class PlayCommand extends Command_1.Command {
    constructor(client) {
        super(client);
    }
    play(url, textChannel, voiceChannel, guild, member) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            const track = yield this.fetchTrack(url, member);
            if (track instanceof Error) {
                return messageEmbed.setDescription(track.message);
            }
            const serverQueue = this.addToActiveQueue(track, guild, voiceChannel, textChannel);
            if (!serverQueue.isPlaying) {
                yield this.playTrack(guild.id);
                messageEmbed.setColor(0x00ff00);
                return this.getNowPlayingInfo(track, messageEmbed);
            }
            return messageEmbed
                .setColor(0x00ff00)
                .setDescription(`${track.title} added to the queue!`);
        });
    }
    /**
     * Grabs the guild's active queue and adds the passed in track
     * to the end of it's track list. It creates a default queue if
     * an active queue is not found
     */
    addToActiveQueue(track, guild, voiceChannel, textChannel) {
        let activeQueue = this.client.activeQueueMap.get(guild.id);
        if (activeQueue === undefined) {
            activeQueue = {
                name: "Default",
                voiceChannel: voiceChannel,
                textChannel: textChannel,
                tracks: [],
                player: null,
                playingMessage: null,
                isPlaying: false,
                isLoop: false,
            };
            this.client.activeQueueMap.set(guild.id, activeQueue);
            this.client.addQueueToList(guild.id, activeQueue);
        }
        activeQueue.tracks.push(track);
        return activeQueue;
    }
    getAudioPlayer(guildId) {
        const client = this.client;
        const activeQ = client.activeQueueMap.get(guildId);
        return activeQ === null || activeQ === void 0 ? void 0 : activeQ.player;
    }
    fetchVideoInfo(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let videoInfo = null;
            try {
                if (ytdl_core_1.default.validateURL(url)) {
                    videoInfo = yield ytdl_core_1.default.getInfo(url);
                }
                else {
                    throw Error("Unable to find track!");
                }
            }
            catch (error) {
                console.log(error);
                throw Error("Error getting track details");
            }
            return videoInfo;
        });
    }
    fetchTrack(url, member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ytdl_core_1.default.validateURL(url)) {
                let trackInfo;
                try {
                    trackInfo = yield this.fetchVideoInfo(url);
                }
                catch (error) {
                    return this.handleError(error);
                }
                if (trackInfo === null) {
                    return this.handleError(`Could not find track!`);
                }
                const duration = parseInt(trackInfo.videoDetails.lengthSeconds);
                const track = {
                    info: trackInfo,
                    title: trackInfo.videoDetails.title,
                    url: trackInfo.videoDetails.video_url,
                    duration: duration,
                    formattedDuration: this.formatDuration(duration),
                    requestedBy: member,
                };
                return track;
            }
            else {
                return this.handleError(new Error("Error fetching track"));
            }
        });
    }
    /**
     * Plays the first track in a guild's active queue.
     */
    playTrack(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeQueue = this.client.activeQueueMap.get(guildId);
            if (!activeQueue)
                return;
            if (activeQueue.tracks.length === 0) {
                return this.handleEmptyQueue(guildId);
            }
            const firstTrack = activeQueue.tracks[0];
            const connection = yield this.connectToChannel(activeQueue.voiceChannel);
            activeQueue.player = yield this.createAudioPlayer(firstTrack);
            connection.subscribe(activeQueue.player);
            activeQueue.isPlaying = true;
            activeQueue.player.on(voice_1.AudioPlayerStatus.Idle, () => {
                activeQueue.isPlaying = false;
                this.handleTrackFinish(guildId);
            });
        });
    }
    /**
     * Creates a VoiceConnection to a passed in VoiceChannel. Once the
     * VoiceConnection is ready, returns the VoiceConnection. Destroys the
     * connection and throws an error if something goes wrong.
     */
    connectToChannel(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            try {
                yield (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 30000);
                connection.on("stateChange", (_, newState) => __awaiter(this, void 0, void 0, function* () {
                    if (newState.status !== voice_1.VoiceConnectionStatus.Disconnected) {
                        return;
                    }
                    if (newState.reason === voice_1.VoiceConnectionDisconnectReason.WebSocketClose &&
                        newState.closeCode === 4014) {
                        try {
                            yield (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Connecting, 5000);
                        }
                        catch (_a) {
                            connection.destroy();
                        }
                    }
                    else if (connection.rejoinAttempts < 5) {
                        connection.rejoin();
                    }
                    else {
                        connection.destroy();
                        return;
                    }
                }));
                return connection;
            }
            catch (error) {
                connection.destroy();
                throw error;
            }
        });
    }
    /**
     * Takes in a Track, converts the Track's url to a stream, creates
     * an AudioResource from the stream and then creates an AudioPlayer
     * for that resource to play. Returns the newly created player.
     */
    createAudioPlayer(track) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = (0, voice_1.createAudioPlayer)();
            let stream = (0, ytdl_core_1.default)(track.url, {
                filter: "audioonly",
                highWaterMark: 1 << 25,
            });
            const resource = (0, voice_1.createAudioResource)(stream, {
                inputType: voice_1.StreamType.Arbitrary,
            });
            player.play(resource);
            return yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Playing, 5000);
        });
    }
    /**
     * When the current track of the guild's active queue ends,
     * push the current track to the end of the list if isLoop is on,
     * and then play the next track
     */
    handleTrackFinish(guildId) {
        const activeQueue = this.client.activeQueueMap.get(guildId);
        if (activeQueue !== null) {
            const track = activeQueue.tracks[0];
            if (activeQueue.isLoop) {
                activeQueue.tracks.push(track);
            }
            activeQueue.tracks.shift();
            this.playTrack(guildId);
        }
    }
    /**
     * Checks if the active queue is empty or if there are no
     * members in the voice chat every 5 minutes. If so, sends a message
     * and disconnects.
     */
    handleEmptyQueue(guildId) {
        const connection = (0, voice_1.getVoiceConnection)(guildId);
        const activeQueue = this.client.activeQueueMap.get(guildId);
        setTimeout(() => {
            if (activeQueue.tracks.length === 0 ||
                activeQueue.voiceChannel.members.size === 0) {
                connection === null || connection === void 0 ? void 0 : connection.destroy();
                this.client.activeQueueMap.delete(guildId);
                this.client.queueListMap.delete(guildId);
                return;
            }
        }, 300000);
    }
    /**
     * Takes in a number of seconds and formats it to a string
     * for displaying a tracks duration
     */
    formatDuration(seconds) {
        if (seconds === 0)
            return "livestream";
        const date = new Date(seconds * 1000).toISOString();
        const formatted = seconds < 3600 ? date.substring(14, 19) : date.substring(12, 19);
        return `[${formatted}]`;
    }
}
exports.PlayCommand = PlayCommand;
