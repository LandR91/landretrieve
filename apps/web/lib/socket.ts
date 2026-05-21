import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getSocket(token: string): Socket {
  if (socket && currentToken === token && socket.connected) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(`${API_URL}/messaging`, {
    auth: { token: `Bearer ${token}` },
    transports: ["polling", "websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    withCredentials: true,
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Errore connessione:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
