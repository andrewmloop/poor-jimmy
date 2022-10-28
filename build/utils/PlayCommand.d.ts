import { EmbedBuilder, Guild, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { Command } from "../utils/Command";
import ytdl from "ytdl-core";
import { Queue, Track } from "../utils/Bot";
import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Client } from "./Client";
export declare abstract class PlayCommand extends Command {
    constructor(client: Client);
    protected play(url: string, textChannel: TextChannel, voiceChannel: VoiceChannel, guild: Guild, member: GuildMember): Promise<EmbedBuilder>;
    /**
     * Grabs the guild's active queue and adds the passed in track
     * to the end of it's track list. It creates a default queue if
     * an active queue is not found
     */
    protected addToActiveQueue(track: Track, guild: Guild, voiceChannel: VoiceChannel, textChannel: TextChannel): Queue;
    protected getAudioPlayer(guildId: string): AudioPlayer;
    protected fetchVideoInfo(url: string): Promise<ytdl.videoInfo>;
    protected fetchTrack(url: string, member: GuildMember): Promise<Track | Error>;
    /**
     * Plays the first track in a guild's active queue.
     */
    protected playTrack(guildId: string): Promise<void>;
    /**
     * Creates a VoiceConnection to a passed in VoiceChannel. Once the
     * VoiceConnection is ready, returns the VoiceConnection. Destroys the
     * connection and throws an error if something goes wrong.
     */
    protected connectToChannel(channel: VoiceChannel): Promise<VoiceConnection>;
    /**
     * Takes in a Track, converts the Track's url to a stream, creates
     * an AudioResource from the stream and then creates an AudioPlayer
     * for that resource to play. Returns the newly created player.
     */
    private createAudioPlayer;
    /**
     * When the current track of the guild's active queue ends,
     * push the current track to the end of the list if isLoop is on,
     * and then play the next track
     */
    private handleTrackFinish;
    /**
     * Checks if the active queue is empty or if there are no
     * members in the voice chat every 5 minutes. If so, sends a message
     * and disconnects.
     */
    private handleEmptyQueue;
    /**
     * Takes in a number of seconds and formats it to a string
     * for displaying a tracks duration
     */
    protected formatDuration(seconds: number): string;
}
