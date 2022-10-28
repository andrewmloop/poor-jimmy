"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandIndex = void 0;
const addToQ_1 = __importDefault(require("./addToQ"));
const commands_1 = __importDefault(require("./commands"));
const createQ_1 = __importDefault(require("./createQ"));
const currentQ_1 = __importDefault(require("./currentQ"));
const list_1 = __importDefault(require("./list"));
const listQ_1 = __importDefault(require("./listQ"));
const listQTracks_1 = __importDefault(require("./listQTracks"));
const loop_1 = __importDefault(require("./loop"));
const nowplaying_1 = __importDefault(require("./nowplaying"));
const pause_1 = __importDefault(require("./pause"));
const ping_1 = __importDefault(require("./ping"));
const play_1 = __importDefault(require("./play"));
const remove_1 = __importDefault(require("./remove"));
const removeQ_1 = __importDefault(require("./removeQ"));
const resume_1 = __importDefault(require("./resume"));
const skip_1 = __importDefault(require("./skip"));
const switchQ_1 = __importDefault(require("./switchQ"));
exports.commandIndex = [
    addToQ_1.default,
    commands_1.default,
    createQ_1.default,
    currentQ_1.default,
    list_1.default,
    listQ_1.default,
    listQTracks_1.default,
    loop_1.default,
    nowplaying_1.default,
    pause_1.default,
    ping_1.default,
    play_1.default,
    remove_1.default,
    removeQ_1.default,
    resume_1.default,
    skip_1.default,
    switchQ_1.default,
];
