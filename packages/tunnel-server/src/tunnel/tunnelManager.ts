import { TunnelClient } from "./types";

class TunnelManager {

  private tunnels = new Map<string, TunnelClient>();
  private pending = new Map<string, any>();

  register(client: TunnelClient) {
    this.tunnels.set(client.subdomain, client);
  }

  remove(subdomain: string) {
    this.tunnels.delete(subdomain);
  }

  get(subdomain: string) {
    return this.tunnels.get(subdomain);
  }

  addPending(requestId: string, reply: any) {
    this.pending.set(requestId, reply);

    // ✅ PRO ADDITION: Timeout cleanup (e.g., 30 seconds)
    // If the local CLI doesn't respond in time, close the connection cleanly.
    setTimeout(() => {
      if (this.pending.has(requestId)) {
        const pendingReply = this.pending.get(requestId);
        
        // Check if Fastify hasn't already sent the response
        if (!pendingReply.sent) {
          pendingReply.code(504).send("Gateway Timeout: Local tunnel did not respond.");
        }
        
        this.pending.delete(requestId);
      }
    }, 30000); // 30 seconds
  }

  resolvePending(requestId: string, data: any) {
    const reply = this.pending.get(requestId);
    if (!reply) return; // Request timed out or was already resolved

    const headers = { ...(data.headers || {}) };

    // Remove problematic headers
    delete headers["content-length"];
    delete headers["transfer-encoding"];
    delete headers["content-encoding"];
    delete headers["connection"];

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        reply.header(key, value as string);
      }
    });

    const bodyBuffer = data.body
      ? Buffer.from(data.body, "base64")
      : Buffer.alloc(0);

    reply.code(data.status || 200).send(bodyBuffer);

    this.pending.delete(requestId);
  }
}

export const tunnelManager = new TunnelManager();