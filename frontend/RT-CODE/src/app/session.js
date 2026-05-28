const SESSION_KEY = "rt-code-session";

export function getRoomSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setRoomSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearRoomSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
