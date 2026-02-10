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
  }

  resolvePending(requestId: string, data: any) {
    const reply = this.pending.get(requestId);
    if (!reply) return;

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
