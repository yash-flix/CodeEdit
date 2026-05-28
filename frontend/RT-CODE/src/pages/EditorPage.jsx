import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

function getRandomColor() {
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function EditorPage() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim() || "";
  const [users, setUsers] = useState([]);
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

  const provider = useMemo(() => {
    if (!username || !roomId) {
      return null;
    }

    return new WebsocketProvider("ws://localhost:1234", roomId, ydoc, {
      autoConnect: true,
    });
  }, [roomId, username, ydoc]);

  useEffect(() => {
    if (!username || !roomId) {
      navigate("/", { replace: true });
    }
  }, [navigate, roomId, username]);

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
      ytext.insert(0, "// Start coding...\n");
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
  }, [editorReady, provider, username, ytext]);

  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  return (
    <main className="editor-shell">
      <aside className="sidebar">
        <div className="sidebar-block">
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

        <div className="sidebar-block">
          <Link className="secondary-link" to="/">
            Switch room
          </Link>
        </div>
      </aside>

      <section className="editor-panel">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleMount}
          options={{
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
        />
      </section>
    </main>
  );
}

export default EditorPage;
