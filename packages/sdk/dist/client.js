"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClient = startClient;
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
function startClient(port) {
    const ws = new ws_1.default("ws://localhost:8080/tunnel");
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
            const proxyReq = http_1.default.request(options, (res) => {
                const chunks = [];
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
