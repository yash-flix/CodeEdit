import { Editor } from "@monaco-editor/react";
import { clearRoomSession, getRoomSession, setRoomSession } from "../app/session";
import { MonacoBinding } from "y-monaco";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

function getRandomColor() {
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const LANGUAGE_OPTIONS = [
  {
    value: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    starter: 'console.log("Hello from JavaScript");\n',
  },
  {
    value: "python",
    label: "Python",
    monacoLanguage: "python",
    starter: 'print("Hello from Python")\n',
  },
  {
    value: "java",
    label: "Java",
    monacoLanguage: "java",
    starter:
      'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java");\n  }\n}\n',
  },
];

const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS[0].value;

function getLanguageConfig(language) {
  return (
    LANGUAGE_OPTIONS.find(option => option.value === language) ??
    LANGUAGE_OPTIONS[0]
  );
}

function isSupportedLanguage(language) {
  return LANGUAGE_OPTIONS.some(option => option.value === language);
}

function EditorPage() {
  const MIN_OUTPUT_HEIGHT = 140;
  const MAX_OUTPUT_HEIGHT = 420;
  const navigate = useNavigate();
  const { roomId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || "";
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [runState, setRunState] = useState({
    isRunning: false,
    output: "",
    error: "",
  });
  const [outputHeight, setOutputHeight] = useState(220);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef(null);
  const userColorRef = useRef(getRandomColor());

  const ydoc = useMemo(() => {
    if (!roomId) {
      return new Y.Doc();
    }

    return new Y.Doc();
  }, [roomId]);
  
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);
  const roomMeta = useMemo(() => ydoc.getMap("room-meta"), [ydoc]);
  const websocketUrl = useMemo(() => {
    const configuredUrl = import.meta.env.VITE_WS_URL?.trim();

    if (configuredUrl) {
      return configuredUrl;
    }

    if (typeof window !== "undefined") {
      if (import.meta.env.DEV) {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        return `${protocol}://${window.location.hostname}:1234`;
      }

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      return `${protocol}://${window.location.host}`;
    }

    return "ws://localhost:1234";
  }, []);

  const provider = useMemo(() => {
    if (!username || !roomId) {
      return null;
    }

    return new WebsocketProvider(websocketUrl, roomId, ydoc, {
      autoConnect: true,
    });
  }, [roomId, username, websocketUrl, ydoc]);

  useEffect(() => {
    const session = getRoomSession();

    if (!username || !roomId) {
      navigate("/", { replace: true });
      return;
    }

    if (!session || session.roomId !== roomId || session.username !== username) {
      navigate(`/?username=${encodeURIComponent(username)}`, { replace: true });
      return;
    }

    setRoomSession({ roomId, username });
  }, [navigate, roomId, username]);

  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguage = roomMeta.get("language");

      if (typeof nextLanguage === "string" && isSupportedLanguage(nextLanguage)) {
        setLanguage(nextLanguage);
        return;
      }

      setLanguage(DEFAULT_LANGUAGE);
    };

    if (!roomMeta.get("language")) {
      roomMeta.set("language", DEFAULT_LANGUAGE);
    }

    roomMeta.observe(syncLanguage);
    syncLanguage();

    return () => {
      roomMeta.unobserve(syncLanguage);
    };
  }, [roomMeta]);

  const handleMount = editor => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  useEffect(() => {
    if (!username || !editorReady || !provider || !editorRef.current) {
      return undefined;
    }

    provider.awareness.setLocalStateField("user", {
      username,
      color: userColorRef.current,
    });

    provider.awareness.setLocalStateField("cursor", {
      anchor: 0,
      head: 0,
    });

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const uniqueUsers = [
        ...new Map(
          states
            .filter(state => state.user?.username)
            .map(state => [state.user.username, state.user])
        ).values(),
      ];

      setUsers(uniqueUsers);
    };

    provider.awareness.on("change", handleAwarenessChange);
    handleAwarenessChange();

    if (ytext.length === 0) {
      ytext.insert(0, getLanguageConfig(roomMeta.get("language")).starter);
    }

    const monacoBinding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      monacoBinding.destroy();
      provider.awareness.setLocalStateField("user", null);
      provider.awareness.off("change", handleAwarenessChange);
      provider.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setUsers([]);
    };
  }, [editorReady, provider, roomMeta, username, ytext]);

  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  const handleLanguageChange = event => {
    const nextLanguage = event.target.value;
    const nextConfig = getLanguageConfig(nextLanguage);

    roomMeta.set("language", nextConfig.value);

    if (ytext.length === 0) {
      ytext.insert(0, nextConfig.starter);
    }
  };

  const handleRunCode = async () => {
    setRunState({
      isRunning: true,
      output: "",
      error: "",
    });

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code: ytext.toString(),
        }),
      });

      const result = await response.json();

      setRunState({
        isRunning: false,
        output: result.output || "",
        error: result.error || "",
      });
    } catch (error) {
      setRunState({
        isRunning: false,
        output: "",
        error: error instanceof Error ? error.message : "Failed to run code.",
      });
    }
  };

  const handleLeaveRoom = () => {
    clearRoomSession();
    navigate(`/?username=${encodeURIComponent(username)}`, { replace: true });
  };

  const handleOutputResizeStart = event => {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = outputHeight;

    const handlePointerMove = moveEvent => {
      const nextHeight = startHeight - (moveEvent.clientY - startY);
      setOutputHeight(Math.min(MAX_OUTPUT_HEIGHT, Math.max(MIN_OUTPUT_HEIGHT, nextHeight)));
      editorRef.current?.layout();
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const outputText =
    [runState.output, runState.error].filter(Boolean).join("\n") ||
    "Run the current room code to see output here.";

  return (
    <main className="editor-shell">
      <aside className="sidebar">
        <div className="sidebar-topbar">
          <button
            type="button"
            className="nav-link nav-link-ghost"
            onClick={handleLeaveRoom}
          >
            Exit room
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={handleLeaveRoom}
          >
            Join another
          </button>
        </div>

        <div className="sidebar-block room-summary">
          <p className="eyebrow">Room</p>
          <h1>{roomId}</h1>
          <p className="room-meta">Signed in as {username}</p>
        </div>

        <div className="sidebar-block">
          <div className="sidebar-heading-row">
            <h2>Online Users</h2>
            <span className="user-count">{users.length}</span>
          </div>

          <ul className="user-list">
            {users.map(user => (
              <li key={user.username} className="user-list-item">
                <span
                  className="user-swatch"
                  style={{ backgroundColor: user.color }}
                />
                <span>{user.username}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-block notes-card">
          <div className="sidebar-heading-row">
            <h2>Language</h2>
            <span className="notes-badge">Room</span>
          </div>
          <label className="field select-field">
            <select value={language} onChange={handleLanguageChange}>
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sidebar-block notes-card">
          <div className="sidebar-heading-row">
            <h2>Notes</h2>
            <span className="notes-badge">Local</span>
          </div>
          <textarea
            className="notes-input"
            placeholder="Scratch ideas, TODOs, meeting points..."
            value={notes}
            onChange={event => setNotes(event.target.value)}
          />
        </div>
      </aside>

      <section className="editor-panel" style={{ "--output-height": `${outputHeight}px` }}>
        <div className="editor-toolbar">
          <div className="toolbar-meta">
            <div className="toolbar-pill">
              {getLanguageConfig(language).label}
            </div>
            <div className="session-chip">
              <span className="session-dot" />
              Collaborative session live
            </div>
          </div>
          <button
            type="button"
            className="primary-button run-button"
            onClick={handleRunCode}
            disabled={runState.isRunning}
          >
            {runState.isRunning ? "Running..." : "Run Code"}
          </button>
        </div>

        <div className="editor-canvas">
          <Editor
            height="100%"
            language={getLanguageConfig(language).monacoLanguage}
            theme="vs-dark"
            onMount={handleMount}
            options={{
              automaticLayout: true,
              cursorSmoothCaretAnimation: "on",
              fontSize: 14,
              lineHeight: 22,
              minimap: { enabled: false },
              overviewRulerBorder: false,
              padding: { top: 18, bottom: 18 },
              renderLineHighlight: "gutter",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
                horizontalScrollbarSize: 10,
                useShadows: false,
                verticalScrollbarSize: 10,
              },
              smoothScrolling: true,
            }}
          />
        </div>

        <button
          type="button"
          className="panel-resizer"
          aria-label="Resize output panel"
          onPointerDown={handleOutputResizeStart}
        >
          <span />
        </button>

        <div className="output-panel">
          <div className="output-header">
            <div className="sidebar-heading-row">
              <h2>Execution Output</h2>
              <span className="notes-badge">Run</span>
            </div>
            <p className="output-caption">
              Console results update here after each run.
            </p>
          </div>

          <pre className={`output-console${runState.error ? " output-console-error" : ""}`}>
            {outputText}
          </pre>
        </div>
      </section>
    </main>
  );
}

export default EditorPage;
