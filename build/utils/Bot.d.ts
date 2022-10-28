import { AudioPlayer } from "@discordjs/voice";
import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
export interface Track {
    info: ytdl.videoInfo;
    title: string;
    url: string;
    duration: number;
    formattedDuration: string;
    requestedBy: GuildMember;
}
export interface Queue {
    name: string | null;
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    tracks: Track[];
    player: AudioPlayer | null;
    playingMessage: Message | null;
    isPlaying: boolean;
    isLoop: boolean;
}
