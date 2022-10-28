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
const PlayCommand_1 = require("../utils/PlayCommand");
class AddToQ extends PlayCommand_1.PlayCommand {
    constructor() {
        super(...arguments);
        this.name = "addtoq";
        this.description = "Add tracks to a specific queue";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("queue")
                .setDescription("The queue to add to")
                .setRequired(true);
        })
            .addStringOption((option) => {
            return option
                .setName("url")
                .setDescription("The URL of the track to add")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const member = interaction.member;
            const queueOption = (_a = interaction.options.get("queue")) === null || _a === void 0 ? void 0 : _a.value;
            const urlOption = (_b = interaction.options.get("url")) === null || _b === void 0 ? void 0 : _b.value;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (activeQueue && activeQueue.name === queueOption) {
                messageEmbed.setDescription("Please use /play to add tracks to the active queue");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const queueList = this.client.queueListMap.get(guildId);
            if (!queueList) {
                messageEmbed.setDescription("No queues found! Use /createq to create a new queue.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const queueToAdd = queueList.find((queue) => queue.name === queueOption);
            if (!queueToAdd) {
                messageEmbed.setDescription(`${queueOption} can't be found!`);
                this.handleReply(interaction, messageEmbed);
                return;
            }
            try {
                const track = yield this.fetchTrack(urlOption, member);
                if (track instanceof Error) {
                    messageEmbed.setDescription(track.message);
                    this.handleReply(interaction, messageEmbed);
                    return;
                }
                queueToAdd.tracks.push(track);
                messageEmbed
                    .setColor(0x00ff00)
                    .setDescription(`${track.title} added to ${queueToAdd.name}`);
                this.handleReply(interaction, messageEmbed);
            }
            catch (error) {
                messageEmbed.setDescription("Unable to find track to add!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
        });
    }
}
exports.default = AddToQ;
