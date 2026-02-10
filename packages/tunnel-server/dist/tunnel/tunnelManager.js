"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tunnelManager = void 0;
class TunnelManager {
    constructor() {
        this.tunnels = new Map();
        this.pending = new Map();
    }
    register(client) {
        this.tunnels.set(client.subdomain, client);
    }
    remove(subdomain) {
        this.tunnels.delete(subdomain);
    }
    get(subdomain) {
        return this.tunnels.get(subdomain);
    }
    addPending(requestId, reply) {
        this.pending.set(requestId, reply);
    }
    resolvePending(requestId, data) {
        const reply = this.pending.get(requestId);
        if (!reply)
            return;
        const headers = { ...(data.headers || {}) };
        // Remove problematic headers
        delete headers["content-length"];
        delete headers["transfer-encoding"];
        delete headers["content-encoding"];
        delete headers["connection"];
        Object.entries(headers).forEach(([key, value]) => {
            if (value !== undefined) {
                reply.header(key, value);
            }
        });
        const bodyBuffer = data.body
            ? Buffer.from(data.body, "base64")
            : Buffer.alloc(0);
        reply.code(data.status || 200).send(bodyBuffer);
        this.pending.delete(requestId);
    }
}
exports.tunnelManager = new TunnelManager();
