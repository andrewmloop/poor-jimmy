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
class CreateQ extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "createq";
        this.description = "Create a queue that can hold it's own list of tracks";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("name")
                .setDescription("The name of the queue to be created")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const queueList = this.client.queueListMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (queueList) {
                const queueName = (_a = interaction.options.get("name")) === null || _a === void 0 ? void 0 : _a.value;
                const member = interaction.member;
                const textChannel = interaction.channel;
                const voiceChannel = member.voice.channel;
                if (queueList === null || queueList === void 0 ? void 0 : queueList.some((queue) => queue.name === queueName)) {
                    messageEmbed.setDescription("A queue with that name already exists!");
                    this.handleReply(interaction, messageEmbed);
                    return;
                }
                const newQueue = {
                    name: queueName,
                    voiceChannel: voiceChannel,
                    textChannel: textChannel,
                    tracks: [],
                    player: null,
                    playingMessage: null,
                    isPlaying: false,
                    isLoop: false,
                };
                this.client.addQueueToList(guildId, newQueue);
                messageEmbed
                    .setColor(0x00ff00)
                    .setDescription(`${queueName} queue created!`);
                this.handleReply(interaction, messageEmbed);
            }
            else {
                messageEmbed.setDescription("Error creating queue!");
                this.handleReply(interaction, messageEmbed);
            }
        });
    }
}
exports.default = CreateQ;
