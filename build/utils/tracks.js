"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
const ytdl_core_discord_1 = __importDefault(require("ytdl-core-discord"));
class Track {
    constructor({ url, title, onStart, onFinish, onError }): TrackData {
        this.url = url;
        this.title = title;
        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }
    createAudioResource() {
        return new Promise((resolve, reject) => {
            const process = (0, ytdl_core_discord_1.default)(this.url, {
                filter: "audioonly",
            });
        });
    }
}
exports.Track = Track;
