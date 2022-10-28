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
class NowPlaying extends PlayCommand_1.PlayCommand {
    constructor() {
        super(...arguments);
        this.name = "nowplaying";
        this.description = "Display info about the currently playing track";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!activeQueue) {
                messageEmbed.setDescription("No active queue found! Use /play or /switchq to start playing a queue.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const track = activeQueue.tracks[0];
            if (track) {
                messageEmbed.setColor(0x00ff00);
                const reply = this.getNowPlayingInfo(track, messageEmbed);
                this.handleReply(interaction, reply);
            }
            else {
                messageEmbed.setDescription("No track playing!");
                this.handleReply(interaction, messageEmbed);
            }
        });
    }
}
exports.default = NowPlaying;
