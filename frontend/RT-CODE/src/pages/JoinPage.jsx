import { useState } from "react";
import { useNavigate } from "react-router-dom";

function createRoomId() {
  return Math.random().toString(36).slice(2, 10);
}

function JoinPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(() => createRoomId());

  const handleJoin = event => {
    event.preventDefault();

    const nextUsername = username.trim();
    const nextRoomId = roomId.trim();

    if (!nextUsername || !nextRoomId) {
      return;
    }

    navigate(
      `/room/${encodeURIComponent(nextRoomId)}?username=${encodeURIComponent(nextUsername)}`
    );
  };

  const handleGenerateRoom = () => {
    setRoomId(createRoomId());
  };

  return (
    <main className="app-shell join-shell">
      <section className="join-card">
        <p className="eyebrow">Realtime Code Editor</p>
        <h1>Enter a room</h1>
        <p className="join-copy">
          Each room keeps its own shared document, presence state, and collaboration
          session.
        </p>

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
    </main>
  );
}

export default JoinPage;
