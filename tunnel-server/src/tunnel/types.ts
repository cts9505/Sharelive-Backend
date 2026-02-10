import { WebSocket } from "@fastify/websocket";

export interface TunnelClient {
  id: string;
  subdomain: string;
  socket: WebSocket;
}
