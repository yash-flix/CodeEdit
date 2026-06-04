import { useEffect, useState } from "react";
import { getRoomSession, setRoomSession } from "../app/session";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function createRoomId() {
  return Math.random().toString(36).slice(2, 10);
}

function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState(() => searchParams.get("username") || "");
  const [roomId, setRoomId] = useState(() => createRoomId());

  useEffect(() => {
    const activeSession = getRoomSession();

    if (!activeSession?.roomId || !activeSession?.username) {
      return;
    }

    navigate(
      `/room/${encodeURIComponent(activeSession.roomId)}?username=${encodeURIComponent(activeSession.username)}`,
      { replace: true }
    );
  }, [navigate]);

  const handleJoin = event => {
    event.preventDefault();

    const nextUsername = username.trim();
    const nextRoomId = roomId.trim();

    if (!nextUsername || !nextRoomId) {
      return;
    }

    setRoomSession({
      roomId: nextRoomId,
      username: nextUsername,
    });

    navigate(
      `/room/${encodeURIComponent(nextRoomId)}?username=${encodeURIComponent(nextUsername)}`,
      { replace: true }
    );
  };

  const handleGenerateRoom = () => {
    setRoomId(createRoomId());
  };

  return (
    <main className="app-shell join-shell">
      <section className="join-layout">
        <div className="join-hero">
          <p className="eyebrow">Collaborative Engineering Workspace</p>
          <h1>Realtime code editor for shared rooms.</h1>
          <p className="join-copy">
            Write, run, and review code with teammates in the same live workspace.
          </p>

          <div className="iso-scene" aria-label="Isometric collaborative code editor preview">
            <div className="iso-window iso-window-main">
              <div className="iso-window-head">
                <span className="iso-dot" />
                <span className="iso-dot" />
                <span className="iso-dot" />
                <b>&lt;/&gt;</b>
              </div>
              <div className="iso-code">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="iso-window iso-window-terminal">
              <span />
              <span />
              <span />
            </div>
            <div className="iso-window iso-window-chat">
              <span />
              <span />
            </div>
            <div className="iso-desk iso-desk-one">
              <span />
              <b />
            </div>
            <div className="iso-desk iso-desk-two">
              <span />
              <b />
            </div>
            <div className="iso-ring" />
            <div className="iso-gear iso-gear-one" />
            <div className="iso-gear iso-gear-two" />
            <div className="iso-cable iso-cable-one" />
            <div className="iso-cable iso-cable-two" />
          </div>
        </div>

        <section className="join-card">
          <div className="join-card-header">
            <p className="eyebrow">Realtime Code Editor</p>
            <h2>Enter a room</h2>
            <p className="join-copy">
              Each room keeps its own shared document, presence state, and collaboration
              session.
            </p>
          </div>

          <form className="join-form" onSubmit={handleJoin}>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={event => setUsername(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Room ID</span>
              <div className="room-input-row">
                <input
                  type="text"
                  placeholder="frontend-team"
                  value={roomId}
                  onChange={event => setRoomId(event.target.value)}
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleGenerateRoom}
                >
                  New ID
                </button>
              </div>
            </label>

            <button type="submit" className="primary-button">
              Join Room
            </button>
          </form>

        </section>
      </section>
    </main>
  );
}

export default JoinPage;
