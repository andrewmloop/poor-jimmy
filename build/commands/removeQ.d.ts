import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils/Command";
export default class RemoveQ extends Command {
    name: string;
    description: string;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
