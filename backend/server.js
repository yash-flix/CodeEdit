import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT) || 1234;

const app = express();
app.use(express.static(publicDir));

// Serve the built SPA from the same container/port as the websocket server.
app.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }

  res.sendFile(path.join(publicDir, "index.html"));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(port, () => {
  console.log(`HTTP + WebSocket server running on port ${port}`);
});
