"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
exports.default = getErrorMessage;
