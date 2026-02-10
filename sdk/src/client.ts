import WebSocket from "ws";
import http from "http";

export function startClient(port: number) {

  const ws = new WebSocket("ws://localhost:8080/tunnel");

  ws.on("message", (raw) => {

    const msg = JSON.parse(raw.toString());

    if (msg.type === "tunnel_created") {
      console.log(`Public URL: https://${msg.subdomain}.sharelive.site`);
    }

    if (msg.type === "request") {

      const options = {
        hostname: "localhost",
        port,
        path: msg.path,
        method: msg.method,
        headers: msg.headers
      };

      const proxyReq = http.request(options, (res) => {

        const chunks: Buffer[] = [];

        res.on("data", c => chunks.push(c));

        res.on("end", () => {

          ws.send(JSON.stringify({
            type: "response",
            requestId: msg.requestId,
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("base64")
          }));

        });
      });

      proxyReq.end();
    }
  });
}
