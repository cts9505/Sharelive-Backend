"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expose = expose;
const client_1 = require("./client");
function expose(port) {
    (0, client_1.startClient)(port);
}
