import WebSocket from "ws";
import http from "http";

export function startClient(port: number) {

  const ws = new WebSocket("wss://tunnel.sharelive.site/tunnel");

  ws.on("open", () => {
    console.log("Connected to Sharelive tunnel server");
  });

  ws.on("error", (err) => {
    console.error("Tunnel connection failed:", err.message);
  });

  ws.on("message", async (raw) => {

    const msg = JSON.parse(raw.toString());

    if (msg.type === "tunnel_created") {
      console.log(
        `Public URL: https://${msg.subdomain}.sharelive.site`
      );
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

        res.on("data", (chunk) => {
          chunks.push(
            Buffer.isBuffer(chunk)
              ? chunk
              : Buffer.from(chunk)
          );
        });

        res.on("end", () => {

          const bodyBuffer = Buffer.concat(chunks);

          const headers = { ...res.headers };

          delete headers["content-length"];
          delete headers["content-encoding"];
          delete headers["transfer-encoding"];
          delete headers["connection"];

          ws.send(JSON.stringify({
            type: "response",
            requestId: msg.requestId,
            status: res.statusCode,
            headers,
            body: bodyBuffer.toString("base64")
          }));
        });
      });

      proxyReq.on("error", () => {
        ws.send(JSON.stringify({
          type: "response",
          requestId: msg.requestId,
          status: 500,
          headers: { "content-type": "text/plain" },
          body: Buffer.from("Local server error").toString("base64")
        }));
      });

      proxyReq.end();
    }
  });

  // Tunnel automatically closes when terminal exits
  process.on("SIGINT", () => {
    console.log("\nClosing tunnel...");
    ws.close();
    process.exit(0);
  });
}
