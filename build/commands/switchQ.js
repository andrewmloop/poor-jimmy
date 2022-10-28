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
class SwitchQ extends PlayCommand_1.PlayCommand {
    constructor() {
        super(...arguments);
        this.name = "switchq";
        this.description = "Switch the active queue and play";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("queue")
                .setDescription("The queue to swtich to")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const queueList = this.client.queueListMap.get(guildId);
            const queueOption = (_a = interaction.options.get("queue")) === null || _a === void 0 ? void 0 : _a.value;
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!queueList) {
                messageEmbed.setDescription("No queues found! Use /createq to create a new queue.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            if (activeQueue && activeQueue.name === queueOption) {
                messageEmbed.setDescription(`${queueOption} is already active!`);
                this.handleReply(interaction, messageEmbed);
                return;
            }
            const queueToSwitchTo = queueList.find((queue) => queue.name === queueOption);
            if (!queueToSwitchTo) {
                messageEmbed.setDescription(`${queueOption} could not be found!`);
                this.handleReply(interaction, messageEmbed);
                return;
            }
            // If the active queue is playing, gracefully stop
            // it before switching to a new queue and playing
            if (activeQueue === null || activeQueue === void 0 ? void 0 : activeQueue.isPlaying) {
                const player = activeQueue.player;
                if (player) {
                    player.stop();
                    try {
                        yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Idle, 5000);
                    }
                    catch (error) {
                        messageEmbed.setDescription("Error stopping player, aborting!");
                        this.handleReply(interaction, messageEmbed);
                        return;
                    }
                }
            }
            this.client.activeQueueMap.set(guildId, queueToSwitchTo);
            messageEmbed
                .setColor(0x00ff00)
                .setDescription(`Switched to ${queueToSwitchTo.name}!`);
            this.handleReply(interaction, messageEmbed);
            this.playTrack(guildId);
        });
    }
}
exports.default = SwitchQ;
