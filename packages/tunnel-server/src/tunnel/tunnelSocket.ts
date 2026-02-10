import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import { tunnelManager } from "./tunnelManager";

export async function tunnelSocket(fastify: FastifyInstance) {

  fastify.get("/tunnel", { websocket: true }, (conn) => {

    const id = uuid();
    const subdomain = id.slice(0, 6);

    tunnelManager.register({
      id,
      subdomain,
      socket: conn.socket
    });

    conn.socket.send(JSON.stringify({
      type: "tunnel_created",
      subdomain
    }));

    conn.socket.on("message", (raw:any) => {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "response") {
        tunnelManager.resolvePending(msg.requestId, msg);
      }
    });

    conn.socket.on("close", () => {
      tunnelManager.remove(subdomain);
    });
  });
}
