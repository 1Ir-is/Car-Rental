require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    id: req.header("x-user-id") || null,
    name: req.header("x-user-name") || null,
    avatar: req.header("x-user-avatar") || null,
    role: req.header("x-user-role") || "USER",
  };

  console.log("server got headers role:", req.user.role); // ✅ Thêm tại đây
  console.log("server got userId:", req.user.id); // ✅ Nên log luôn

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

  socket.on("join:conversation", (convId) => {
    socket.join(String(convId));
    console.log(`Socket ${socket.id} joined room ${convId}`);
  });

  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("message:send", async (data) => {
    const { conversationId, senderId, content } = data;

    const msg = await Message.create({
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
    });

    // ✅ Lấy danh sách user trong conversation để emit cho đúng người
    const conv = await Conversation.findById(conversationId).lean();
    if (!conv) return;

    conv.participants.forEach((p) => {
      const sid = onlineUsers.get(p.userId);
      if (sid) {
        io.to(sid).emit("message:receive", {
          ...msg.toObject(),
          senderId: String(msg.senderId),
        });
      }
    });
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
