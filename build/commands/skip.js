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
const PlayCommand_1 = require("../utils/PlayCommand");
class Skip extends PlayCommand_1.PlayCommand {
    constructor() {
        super(...arguments);
        this.name = "skip";
        this.description = "Skips the current track";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const player = this.getAudioPlayer(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!activeQueue) {
                messageEmbed.setDescription("No active queue found! Use /play or /switchq to start playing a queue.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const tracks = activeQueue.tracks;
            if (!tracks || tracks.length === 0) {
                messageEmbed.setDescription("There is nothing to skip!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const current = tracks[0];
            if (activeQueue.isLoop) {
                tracks.push(current);
            }
            tracks.shift();
            if (tracks.length > 0) {
                // This isn't needed, but pausing the player before playing
                // the next track is less jarring
                player.pause();
                yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Paused, 5000);
                this.playTrack(guildId);
                messageEmbed.setColor(0x00ff00);
                let reply = this.getNowPlayingInfo(tracks[0], messageEmbed);
                this.handleReply(interaction, reply);
            }
            else {
                try {
                    player.stop();
                    yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Idle, 5000);
                    messageEmbed.setColor(0x00ff00).setDescription("The queue has ended!");
                    this.handleReply(interaction, messageEmbed);
                }
                catch (error) {
                    messageEmbed.setDescription("Error skipping track!");
                    this.handleReply(interaction, messageEmbed);
                }
            }
        });
    }
}
exports.default = Skip;
