require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");

const app = express();
app.use(cors());
app.use(express.json());

// simple middleware to mock auth (replace with JWT in prod)
app.use((req, res, next) => {
  // recommended: replace with real auth; here we accept x-user-id header for demo
  req.user = {
    id: req.header("x-user-id") || null,
    name: req.header("x-user-name") || null,
    avatar: req.header("x-user-avatar") || null,
  };
  next();
});

app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// socket users map: userId => socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // client sends "user:online" after connecting with their userId
  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log("user online", userId);
  });

  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  // new message (server should persist; we call REST from FE OR use socket to save)
  socket.on("message:send", async (payload) => {
    // payload: { conversationId, senderId, content, meta? }
    const Message = require("./models/Message");
    try {
      const msg = await Message.create({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
        createdAt: new Date(),
        readBy: [payload.senderId], // sender has read it
      });
      // emit to room (conversation)
      io.to(payload.conversationId).emit("message:receive", msg);

      // also emit to recipient if online (optional: find recipientId)
      // we don't assume conversation model here; front-end joins room for both participants.
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("typing", ({ conversationId, userId, typing }) => {
    socket
      .to(conversationId)
      .emit("typing", { conversationId, userId, typing });
  });

  socket.on("disconnect", () => {
    if (socket.userId) onlineUsers.delete(socket.userId);
    console.log("socket disconnect", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ Mongo connect error", err));
