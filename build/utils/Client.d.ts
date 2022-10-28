import { Client as DiscordClient, Collection } from "discord.js";
import { Queue } from "./Bot";
import { Command } from "./Command";
export declare class Client extends DiscordClient {
    token: string;
    commands: Collection<string, Command>;
    queueListMap: Map<string, Queue[]>;
    activeQueueMap: Map<string, Queue>;
    constructor(token?: string);
    private deployCommands;
    addQueueToList(guildId: string, queue: Queue): void;
}
