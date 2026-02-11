import WebSocket from "ws";

export interface TunnelClient {
  id: string;
  subdomain: string;
  socket: WebSocket;
}
