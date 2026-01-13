// src/socket.js
import { io } from "socket.io-client";
const BASE_URL = import.meta.env.VITE_MAIN_URL

export const socket = io(`${BASE_URL}`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
