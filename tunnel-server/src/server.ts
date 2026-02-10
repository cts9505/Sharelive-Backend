import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { tunnelSocket } from "./tunnel/tunnelSocket";
import { publicProxy } from "./routes/publicProxy";

async function start() {

  const fastify = Fastify({ logger: true });

  await fastify.register(websocket);

  await tunnelSocket(fastify);
  await publicProxy(fastify);

  await fastify.listen({
    port: 8080,
    host: "0.0.0.0"
  });
}

start();
