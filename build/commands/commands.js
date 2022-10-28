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
const Command_1 = require("../utils/Command");
class Commands extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "commands";
        this.description = "Displays a list of all the bot's commands";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const commandList = this.client.commands;
            const commandListEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("Command List");
            commandList.each((command, name) => {
                commandListEmbed.addFields({
                    name: `/${name}`,
                    value: command.description,
                    inline: false,
                });
            });
            interaction.editReply({
                embeds: [commandListEmbed],
            });
        });
    }
}
exports.default = Commands;
