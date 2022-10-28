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
class CurrentQ extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "currentq";
        this.description = "Displays the current queue and it's tracks";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!activeQueue) {
                messageEmbed.setDescription("No active queue found! Use /play or /switchq to switch to one!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            messageEmbed
                .setTitle("Current Queue")
                .setColor(0x00ff00)
                .setDescription(activeQueue.name);
            const tracks = activeQueue.tracks;
            if (!tracks || tracks.length === 0) {
                messageEmbed.addFields({
                    name: "Tracks",
                    value: "Nothing queued!",
                    inline: false,
                });
                this.handleReply(interaction, messageEmbed);
            }
            else {
                let replyString = "";
                tracks.forEach((track, index) => {
                    replyString = replyString + this.formatListItem(track.title, index);
                });
                messageEmbed.addFields({ name: "Tracks", value: replyString });
                this.handleReply(interaction, messageEmbed);
            }
        });
    }
    formatListItem(title, index) {
        return `#${index + 1}: ${title}\n`;
    }
}
exports.default = CurrentQ;
