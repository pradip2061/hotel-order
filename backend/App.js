const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Required for socket.io
const { Server } = require("socket.io"); // Socket.io server
const Authrouter = require("./router/AuthRouterjs");
const connectDB = require("./database");
const orderRouter = require("./router/OrderRouter");
const menuRouter = require("./router/MenuRouter");
require("dotenv").config();

connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "https://hotel-order-ve5c.vercel.app", // front-end origin
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/chiyaguff/auth", Authrouter);
app.use("/chiyaguff/order", orderRouter);
app.use("/chiyaguff/menu", menuRouter);
// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.IO`);
  console.log(`📡 Socket.IO ready to accept connections`);
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://hotel-order-ve5c.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});


app.set("io", io);
// Handle socket connections
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${io.sockets.sockets.size}`);

   socket.on("joinRoom", (room) => {
    socket.join(room); // room can be "chef", "waiter", etc.
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    console.log(`📊 Total connected clients: ${io.sockets.sockets.size}`);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});
