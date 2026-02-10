"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicProxy = publicProxy;
const tunnelManager_1 = require("../tunnel/tunnelManager");
const uuid_1 = require("uuid");
async function publicProxy(fastify) {
    fastify.all("/*", async (request, reply) => {
        const host = request.headers.host || "";
        const subdomain = host.split(".")[0];
        const tunnel = tunnelManager_1.tunnelManager.get(subdomain);
        if (!tunnel) {
            return reply.status(404).send("Tunnel not found");
        }
        const requestId = (0, uuid_1.v4)();
        tunnelManager_1.tunnelManager.addPending(requestId, reply);
        tunnel.socket.send(JSON.stringify({
            type: "request",
            requestId,
            method: request.method,
            path: request.url,
            headers: request.headers,
            body: ""
        }));
    });
}
