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
class ListQTracks extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "listqueuetracks";
        this.description = "Display a queue's tracks";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("queue")
                .setDescription("The name of the queue")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const queueOption = (_a = interaction.options.get("queue")) === null || _a === void 0 ? void 0 : _a.value;
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            const queueList = this.client.queueListMap.get(guildId);
            if (!queueList) {
                messageEmbed.setDescription("This guild has no queues! Use /createq to make one.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            let foundQueue = queueList.find((queue) => queue.name === queueOption);
            if (!foundQueue) {
                messageEmbed.setDescription(`No queue was found with the name: ${queueOption}!`);
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const titles = foundQueue.tracks.map((track) => track.title);
            let replyString = "";
            titles.forEach((title, index) => {
                replyString = replyString + this.formatListItem(title, index);
            });
            messageEmbed
                .setColor(0x00ff00)
                .setTitle(foundQueue.name)
                .addFields({ name: "Tracks", value: replyString });
            this.handleReply(interaction, messageEmbed);
        });
    }
    formatListItem(title, index) {
        return `#${index + 1}: ${title}\n`;
    }
}
exports.default = ListQTracks;
