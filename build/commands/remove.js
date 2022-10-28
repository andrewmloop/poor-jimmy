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
class Remove extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "remove";
        this.description = "Remove a track from the active queue";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption((option) => {
            return option
                .setName("index")
                .setDescription("The index of the track in the queue. Use /list for the index")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!activeQueue) {
                messageEmbed.setDescription("No active queue found! Use /play or /switchq to start playing a queue.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const tracks = activeQueue.tracks;
            const index = (_a = interaction.options.get("index")) === null || _a === void 0 ? void 0 : _a.value;
            // Error handling for an empty queue and improper index input
            if (!tracks || tracks.length === 0) {
                messageEmbed.setDescription("There are no tracks queued!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            if (index < 0 && index > tracks.length - 1) {
                messageEmbed.setDescription("Please choose an index in range!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            if (index === 0) {
                messageEmbed.setDescription("Use /skip to remove the current track");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const removedSong = tracks.splice(index, 1)[0];
            messageEmbed
                .setColor(0x00ff00)
                .setDescription(`Removed ${removedSong.title}`);
            this.handleReply(interaction, messageEmbed);
        });
    }
}
exports.default = Remove;
