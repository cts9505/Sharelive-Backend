"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const tunnelSocket_1 = require("./tunnel/tunnelSocket");
const publicProxy_1 = require("./routes/publicProxy");
async function start() {
    const fastify = (0, fastify_1.default)({ logger: true });
    await fastify.register(websocket_1.default);
    await (0, tunnelSocket_1.tunnelSocket)(fastify);
    await (0, publicProxy_1.publicProxy)(fastify);
    await fastify.listen({
        port: 8080,
        host: "0.0.0.0"
    });
}
start();
