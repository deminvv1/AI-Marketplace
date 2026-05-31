import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(token?: string): Socket | null {
  if (socket?.connected) return socket;
  if (!token) return socket; // return existing (possibly disconnected) instance

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}