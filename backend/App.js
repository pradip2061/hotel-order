const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const Authrouter = require("./router/AuthRouterjs");
const orderRouter = require("./router/OrderRouter");
const menuRouter = require("./router/MenuRouter");
const notificationRouter = require("./router/NotificationRouter");
const connectDB = require("./database");

connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/chiyaguff/auth", Authrouter);
app.use("/chiyaguff/order", orderRouter);
app.use("/chiyaguff/menu", menuRouter);
app.use("/chiyaguff/notifications", notificationRouter);

// Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Save io in app for later use
app.set("io", io);

// 🔥 ONLINE USERS MAP
const onlineUsers = new Map(); // userId -> socketId
app.set("onlineUsers", onlineUsers);

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", (userid) => {
    if (!userid) return;
    onlineUsers.set(userid, socket.id);
    socket.userId = userid;

    console.log(`User online: ${userid}`);
    console.log(`Online users count: ${onlineUsers.size}`); // ✅ This is correct here
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User offline: ${socket.userId}`);
      console.log(`Online users count: ${onlineUsers.size}`); // ✅ Also correct here
    }
  });
});


// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
});

