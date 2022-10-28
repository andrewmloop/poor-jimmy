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
exports.Client = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = require("../commands");
class Client extends discord_js_1.Client {
    constructor(token) {
        super({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildVoiceStates,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
        this.token = token;
        this.commands = new discord_js_1.Collection();
        this.queueListMap = new Map();
        this.activeQueueMap = new Map();
        // Load all commands
        for (let command of commands_1.commandIndex) {
            const commandObject = new command(this);
            this.commands.set(commandObject.name, commandObject);
        }
        this.deployCommands(this.commands, this.token);
        this.once("ready", () => {
            var _a, _b;
            console.log("Ready as: " + ((_a = this.user) === null || _a === void 0 ? void 0 : _a.username) + "#" + ((_b = this.user) === null || _b === void 0 ? void 0 : _b.discriminator));
        });
        this.addListener(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            // Add guildId to queueListMap if not present
            const guildId = interaction.guildId;
            if (this.queueListMap.get(guildId) === undefined) {
                this.queueListMap.set(guildId, []);
            }
            // Don't let a member that is not in a voice
            // channel use commands
            const member = interaction.member;
            if (!member.voice.channel) {
                interaction.reply("You are not in a voice channel!");
                return;
            }
            try {
                const command = this.commands.get(interaction.commandName);
                command === null || command === void 0 ? void 0 : command.execute(interaction);
            }
            catch (error) {
                console.log(error);
                interaction.followUp(`Error executing command: ${error}`);
            }
        }));
    }
    deployCommands(commands, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandData = commands.map((command) => command.data.toJSON());
            const rest = new discord_js_1.REST({ version: "10" }).setToken(token);
            const CLIENTID = process.env.CLIENTID;
            try {
                yield rest.put(discord_js_1.Routes.applicationCommands(CLIENTID), {
                    body: commandData,
                });
                console.log("Successfully deployed slash commands!");
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    addQueueToList(guildId, queue) {
        const queueList = this.queueListMap.get(guildId);
        if (queueList) {
            queueList.push(queue);
        }
        else {
            const initList = [queue];
            this.queueListMap.set(guildId, initList);
        }
    }
}
exports.Client = Client;
