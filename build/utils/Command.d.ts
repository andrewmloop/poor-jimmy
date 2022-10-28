import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Track } from "./Bot";
import { Client } from "./Client";
export declare abstract class Command {
    client: Client;
    abstract name: string;
    abstract description: string;
    abstract data: any;
    abstract execute: (Interaction: CommandInteraction) => Promise<void>;
    constructor(client: Client);
    protected handleReply(interaction: CommandInteraction, embed: EmbedBuilder): void;
    protected handleError(error: unknown): Error;
    protected getErrorMessage(error: unknown): string;
    protected getNowPlayingInfo(track: Track, embed: EmbedBuilder): EmbedBuilder;
}
