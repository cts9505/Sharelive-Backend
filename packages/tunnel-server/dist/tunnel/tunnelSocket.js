"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tunnelSocket = tunnelSocket;
const uuid_1 = require("uuid");
const tunnelManager_1 = require("./tunnelManager");
async function tunnelSocket(fastify) {
    fastify.get("/tunnel", { websocket: true }, (conn) => {
        const id = (0, uuid_1.v4)();
        const subdomain = id.slice(0, 6);
        tunnelManager_1.tunnelManager.register({
            id,
            subdomain,
            socket: conn.socket
        });
        conn.socket.send(JSON.stringify({
            type: "tunnel_created",
            subdomain
        }));
        conn.socket.on("message", (raw) => {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "response") {
                tunnelManager_1.tunnelManager.resolvePending(msg.requestId, msg);
            }
        });
        conn.socket.on("close", () => {
            tunnelManager_1.tunnelManager.remove(subdomain);
        });
    });
}
