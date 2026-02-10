import { TunnelClient } from "./types";

class TunnelManager {
  private tunnels = new Map<string, TunnelClient>();

    private pendingRequests = new Map<string, any>();

    addPending(requestId: string, reply: any) {
    this.pendingRequests.set(requestId, reply);
    }

    resolvePending(requestId: string, data: any) {
    const reply = this.pendingRequests.get(requestId);
    if (!reply) return;

    reply
        .code(data.status)
        .headers(data.headers)
        .send(Buffer.from(data.body, "base64"));

    this.pendingRequests.delete(requestId);
    }

  register(client: TunnelClient) {
    this.tunnels.set(client.subdomain, client);
  }

  remove(subdomain: string) {
    this.tunnels.delete(subdomain);
  }

  get(subdomain: string) {
    return this.tunnels.get(subdomain);
  }
}

export const tunnelManager = new TunnelManager();
