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
    const { conversationId, senderId, content, images, image, file, replyTo } =
      data;

    const msg = await Message.create({
      conversationId,
      senderId,
      content,
      image: image || (images && images.length === 1 ? images[0] : undefined),
      images: images && images.length > 1 ? images : undefined,
      file: file,
      replyTo: replyTo || null, // <--- LƯU replyTo
      createdAt: new Date(),
      readBy: [senderId],
    });
    // Lấy lại message vừa tạo (đảm bảo đầy đủ dữ liệu)
    const fullMsg = await Message.findById(msg._id).lean();
    // Emit cho tất cả user trong room (KHÔNG chỉ emit cho người gửi)
    io.to(String(conversationId)).emit("message:receive", fullMsg);

    // Gửi update conversation (tùy dùng hoặc không)
    const conv = await Conversation.findById(conversationId).populate(
      "participants.userId"
    );
    io.to(String(conversationId)).emit("conversation:update", conv);
  });

  socket.on(
    "message:react",
    async ({ messageId, emoji, userId, conversationId }) => {
      if (!messageId || !emoji || !userId || !conversationId) return;
      const msg = await Message.findById(messageId);
      const existed = msg.reactions?.find(
        (r) => r.userId === userId && r.emoji === emoji
      );
      let newMsg;
      if (existed) {
        newMsg = await Message.findByIdAndUpdate(
          messageId,
          { $pull: { reactions: { emoji, userId } } },
          { new: true }
        );
      } else {
        newMsg = await Message.findByIdAndUpdate(
          messageId,
          { $push: { reactions: { emoji, userId } } },
          { new: true }
        );
      }
      // Emit tới phòng này để mọi người cập nhật
      io.to(String(conversationId)).emit("message:reaction-update", {
        messageId,
        reactions: newMsg.reactions,
      });
    }
  );

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
