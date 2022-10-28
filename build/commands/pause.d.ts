import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";
export default class Pause extends Command {
    name: string;
    description: string;
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
