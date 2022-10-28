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
class Ping extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "ping";
        this.description = "Replies with Pong! and this bot's latency";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const messageEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0x00ff00)
                .setDescription(this.ping(interaction.createdTimestamp));
            this.handleReply(interaction, messageEmbed);
        });
    }
    ping(startTime) {
        const ping = Math.abs(startTime - Date.now());
        return `Pong! :ping_pong: Ping is ${ping} ms`;
    }
}
exports.default = Ping;
