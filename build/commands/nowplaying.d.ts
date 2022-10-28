import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";
export default class NowPlaying extends PlayCommand {
    name: string;
    description: string;
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
