import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket;

export function useSocket() {
  const socketRef = useRef(null);
  useEffect(() => {
    if (!socket) socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
  }, []);
  return socketRef.current || socket;
}
