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
class RemoveQ extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "removeq";
        this.description = "Remove an existing queue from your list of available queues";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName("name")
                .setDescription("The name of the queue to be removed")
                .setRequired(true);
        });
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            // Grab required variables
            const guildId = interaction.guildId;
            const activeQueue = this.client.activeQueueMap.get(guildId);
            const queueList = this.client.queueListMap.get(guildId);
            const option = (_a = interaction.options.get("name")) === null || _a === void 0 ? void 0 : _a.value;
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            // Make sure the queue to be removed is not the current queue playing
            if (activeQueue && activeQueue.name === option) {
                messageEmbed.setDescription("You can't remove the active queue. Please /switchq to another before removing!");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            if (!queueList || queueList.length === 0) {
                messageEmbed.setDescription("This guild has no queues! Use /createq to make one.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            // Remove queue
            let isSuccess = false;
            queueList.forEach((queue, index) => {
                if (queue.name === option) {
                    queueList.splice(index, 1);
                    isSuccess = true;
                }
            });
            // Edit reply
            if (isSuccess) {
                messageEmbed
                    .setColor(0x00ff00)
                    .setDescription(`Successfully removed ${option}`);
                this.handleReply(interaction, messageEmbed);
            }
            else {
                messageEmbed.setDescription(`Unable to find ${option}`);
                this.handleReply(interaction, messageEmbed);
            }
        });
    }
}
exports.default = RemoveQ;
