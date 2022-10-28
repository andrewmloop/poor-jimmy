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
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const Command_1 = require("../utils/Command");
class Pause extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "pause";
        this.description = "Pause the current track";
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
            if (activeQueue.isPlaying === false) {
                messageEmbed.setDescription("The current track is already paused!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const player = activeQueue.player;
            player.pause();
            try {
                yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Paused, 5000);
                activeQueue.isPlaying = false;
                messageEmbed.setColor(0x00ff00).setDescription("Track paused!");
                this.handleReply(interaction, messageEmbed);
            }
            catch (error) {
                messageEmbed.setDescription("Unable to pause track!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
        });
    }
}
exports.default = Pause;
