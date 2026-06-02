import http from "http";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true
    })
})

app.get(/^(?!\/health$).*/, (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

server.listen(1234, "0.0.0.0", () => {
  console.log("Server running on port 1234");
});
