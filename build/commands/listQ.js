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
class ListQ extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "listqueues";
        this.description = "Display a list of created queues";
        this.data = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.execute = (interaction) => __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const guildId = interaction.guildId;
            const queueList = this.client.queueListMap.get(guildId);
            const messageEmbed = new discord_js_1.EmbedBuilder().setColor(0xff0000);
            if (!queueList || queueList.length === 0) {
                messageEmbed.setDescription("This guild has no queues! Use /createq to make one.");
                this.handleReply(interaction, messageEmbed);
                return;
            }
            let replyString = "";
            queueList.forEach((queue, index) => {
                replyString =
                    replyString + this.formatListItem(queue.name, index);
            });
            messageEmbed
                .setColor(0x00ff00)
                .setTitle("Queue List")
                .addFields({ name: "Queues", value: replyString });
            this.handleReply(interaction, messageEmbed);
        });
    }
    formatListItem(name, index) {
        return `#${index + 1}: ${name}\n`;
    }
}
exports.default = ListQ;
