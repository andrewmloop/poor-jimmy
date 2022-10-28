"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor(client) {
        this.client = client;
    }
    handleReply(interaction, embed) {
        interaction.editReply({
            embeds: [embed],
        });
    }
    handleError(error) {
        if (error instanceof Error) {
            return error;
        }
        else {
            return new Error(error);
        }
    }
    getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return error;
    }
    getNowPlayingInfo(track, embed) {
        const thumbnailURL = track.info.videoDetails.thumbnails[0].url;
        const requester = track.requestedBy.user.username;
        const duration = track.formattedDuration;
        return embed
            .setTitle("Now Playing:")
            .setDescription(track.title)
            .setImage(thumbnailURL)
            .addFields({ name: "Requested by:", value: requester, inline: true }, { name: "Duration:", value: duration, inline: true });
    }
}
exports.Command = Command;
