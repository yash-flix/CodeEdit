import http from "http";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import os from "os";
import { spawn } from "child_process";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const EXEC_TIMEOUT_MS = 10000;
const PORT = Number(process.env.PORT || 1234);
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const LANGUAGE_CONFIG = {
  javascript: {
    extension: "mjs",
    prepare: code => ({
      command: "node",
      args: ["main.mjs"],
      files: [{ name: "main.mjs", content: code }],
    }),
  },
  python: {
    extension: "py",
    prepare: code => ({
      command: "python",
      args: ["main.py"],
      files: [{ name: "main.py", content: code }],
    }),
  },
  java: {
    extension: "java",
    prepare: code => ({
      command: "javac",
      args: ["Main.java"],
      files: [{ name: "Main.java", content: code }],
      afterCompile: {
        command: "java",
        args: ["Main"],
      },
    }),
  },
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.static(publicDir));
app.use(express.json({ limit: "1mb" }));

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

function runCommand(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, EXEC_TIMEOUT_MS);

    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });

    child.on("error", error => {
      clearTimeout(timeout);
      const message =
        error.code === "EPERM"
          ? "Execution is blocked by the current environment permissions.\n"
          : `${error.message}\n`;

      resolve({
        ok: false,
        stdout,
        stderr: `${stderr}${message}`,
        timedOut: false,
      });
    });

    child.on("close", code => {
      clearTimeout(timeout);
      resolve({
        ok: code === 0 && !timedOut,
        stdout,
        stderr: timedOut ? `${stderr}Execution timed out.\n` : stderr,
        timedOut,
      });
    });
  });
}

async function executeCode(language, code) {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    return {
      ok: false,
      stdout: "",
      stderr: `Unsupported language: ${language}`,
    };
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "rt-code-"));

  try {
    const runtime = config.prepare(code);

    await Promise.all(
      runtime.files.map(file =>
        fs.writeFile(path.join(tempDir, file.name), file.content, "utf8")
      )
    );

    const firstStep = await runCommand(runtime.command, runtime.args, tempDir);

    if (!firstStep.ok || !runtime.afterCompile) {
      return firstStep;
    }

    const secondStep = await runCommand(
      runtime.afterCompile.command,
      runtime.afterCompile.args,
      tempDir
    );

    return {
      ok: secondStep.ok,
      stdout: `${firstStep.stdout}${secondStep.stdout}`,
      stderr: `${firstStep.stderr}${secondStep.stderr}`,
      timedOut: secondStep.timedOut,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

app.post("/api/run", async (req, res) => {
  const language = req.body?.language;
  const code = req.body?.code;

  if (typeof language !== "string" || typeof code !== "string") {
    res.status(400).json({
      success: false,
      output: "",
      error: "Both language and code are required.",
    });
    return;
  }

  try {
    const result = await executeCode(language, code);

    res.status(result.ok ? 200 : 400).json({
      success: result.ok,
      output: result.stdout,
      error: result.stderr,
      timedOut: Boolean(result.timedOut),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Unexpected execution error.",
    });
  }
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
