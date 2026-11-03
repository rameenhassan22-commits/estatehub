import { io } from "socket.io-client";

// Socket.IO lives on the same server as the API, just without the "/api" part of the URL.
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || new URL(apiUrl).origin;

// Opens the connection and proves who we are with the JWT. The server refuses it if the token is bad.
export const createSocket = (token) =>
  io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionDelayMax: 10000, // keep retrying with back-off if the server restarts
  });