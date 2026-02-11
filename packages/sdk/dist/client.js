"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClient = startClient;
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
/**
 * Safely read entire HTTP response into a buffer.
 */
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}
function startClient(port) {
    const ws = new ws_1.default("wss://tunnel.sharelive.site/tunnel");
    ws.on("open", () => {
        console.log("Connected to Sharelive tunnel server");
    });
    ws.on("error", (err) => {
        console.error("Tunnel connection failed:", err.message);
    });
    ws.on("message", async (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "tunnel_created") {
            console.log(`Public URL: https://${msg.subdomain}.sharelive.site`);
            return;
        }
        if (msg.type !== "request")
            return;
        const options = {
            hostname: "localhost",
            port,
            path: msg.path,
            method: msg.method,
            headers: {
                ...msg.headers,
                // ✅ FIX 1: Override the host header so 'Go Live' server accepts it
                host: `localhost:${port}`,
                "accept-encoding": "identity"
            }
        };
        const proxyReq = http_1.default.request(options, async (res) => {
            try {
                const bodyBuffer = await streamToBuffer(res);
                const headers = { ...res.headers };
                delete headers["content-length"];
                delete headers["content-encoding"];
                delete headers["transfer-encoding"];
                delete headers["connection"];
                ws.send(JSON.stringify({
                    type: "response",
                    requestId: msg.requestId,
                    status: res.statusCode || 200,
                    headers,
                    // Sending as Base64 string over WebSocket
                    body: bodyBuffer.toString("base64")
                }));
            }
            catch (err) {
                ws.send(JSON.stringify({
                    type: "response",
                    requestId: msg.requestId,
                    status: 500,
                    headers: { "content-type": "text/plain" },
                    body: Buffer.from("Tunnel read error").toString("base64")
                }));
            }
        });
        proxyReq.on("error", () => {
            ws.send(JSON.stringify({
                type: "response",
                requestId: msg.requestId,
                status: 502,
                headers: { "content-type": "text/plain" },
                body: Buffer.from("Local server offline").toString("base64")
            }));
        });
        // If the incoming public request had a body (like a POST), 
        // you would write it to proxyReq here before calling end().
        proxyReq.end();
    });
    process.on("SIGINT", () => {
        console.log("\nClosing tunnel...");
        ws.close();
        process.exit(0);
    });
}
