import { FastifyInstance } from "fastify";
import { tunnelManager } from "../tunnel/tunnelManager";
import { v4 as uuidv4 } from "uuid";

export async function publicProxy(fastify: FastifyInstance) {

  fastify.all("/*", async (request, reply) => {

    const host = request.headers.host || "";
    const subdomain = host.split(".")[0];

    const tunnel = tunnelManager.get(subdomain);

    if (!tunnel) {
      return reply.status(404).send("Tunnel not found");
    }

    const requestId = uuidv4();

    tunnelManager.addPending(requestId, reply);

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
