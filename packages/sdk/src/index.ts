import { startClient } from "./client";

export function expose(port: number) {
  startClient(port);
}
