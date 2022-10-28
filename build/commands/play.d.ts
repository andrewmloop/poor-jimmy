import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { PlayCommand } from "../utils/PlayCommand";
export default class Play extends PlayCommand {
    name: string;
    description: string;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
