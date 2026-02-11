import { FastifyInstance } from "fastify";
import { tunnelManager } from "../tunnel/tunnelManager";
import { v4 as uuidv4 } from "uuid";

export async function publicProxy(fastify: FastifyInstance) {
  
  // ✅ FIX 1: Removed 'async' so Fastify waits for reply.send()
  fastify.all("/*", (request, reply) => {

    const host = request.headers.host || "";
    const subdomain = host.split(".")[0];

    const tunnel = tunnelManager.get(subdomain);

    if (!tunnel) {
      // Added return to stop execution
      return reply.status(404).send("Tunnel not found"); 
    }

    const requestId = uuidv4();

    // Storing the 'reply' object so we can use it when the WebSocket responds
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