// Full chatbox Node.js + MongoDB code with:
// - Online/offline status
// - New message notification
// - Avatar, display name, role
// - Pagination for chat history
// - API lấy danh sách user đã từng nhắn cho owner

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(
  "mongodb+srv://mhuynk1005_db_user:juzfPuawt6qLB11n@cluster0.lqafxen.mongodb.net/chatbox?retryWrites=true&w=majority&appName=Cluster0"
);

// Message schema/model
const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    senderId: String,
    receiverId: String,
    senderName: String,
    receiverName: String,
    senderAvatar: String,
    receiverAvatar: String,
    senderRole: String,
    receiverRole: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  })
);

// Online users tracking
let onlineUsers = {}; // { userId: true/false }

// REST API: get chat history (with pagination)
app.get("/api/messages", async (req, res) => {
  const { userId, ownerId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const query = {
    $or: [
      { senderId: userId, receiverId: ownerId },
      { senderId: ownerId, receiverId: userId },
    ],
  };
  const msgs = await Message.find(query)
    .sort({ createdAt: 1 })
    .skip(Number(skip))
    .limit(Number(limit));
  const total = await Message.countDocuments(query);
  res.json({ messages: msgs, total });
});

// REST API: mark as read
app.post("/api/messages/read", async (req, res) => {
  const { senderId, receiverId } = req.body;
  await Message.updateMany(
    { senderId, receiverId, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});

// REST API: get all users who have chatted with owner (for owner dashboard)
app.get("/api/chat-users", async (req, res) => {
  const { ownerId } = req.query;
  // Lấy tất cả senderId đã gửi tới ownerId, group by senderId
  const users = await Message.aggregate([
    { $match: { receiverId: ownerId } },
    { $group: { _id: "$senderId", lastMsg: { $last: "$content" } } },
  ]);
  // Nếu bạn có bảng users, hãy join để lấy info, tạm trả về id và tên giả
  // TODO: Nâng cấp: join với bảng users để lấy avatar, name thật
  const usersInfo = users.map((u) => ({
    id: u._id,
    name: `User ${u._id}`,
    avatar: "https://i.imgur.com/placeholder.png", // đổi thành avatar thật nếu có
  }));
  res.json({ users: usersInfo });
});

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// SOCKET.IO: connection, online status, chat, notification
io.on("connection", (socket) => {
  socket.on("join", ({ userId }) => {
    socket.join(userId);
    onlineUsers[userId] = true;
    io.emit(
      "online_users",
      Object.keys(onlineUsers).filter((u) => onlineUsers[u])
    );
  });

  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      if (
        onlineUsers[userId] &&
        io.sockets.adapter.rooms.get(userId)?.has(socket.id)
      ) {
        onlineUsers[userId] = false;
        break;
      }
    }
    io.emit(
      "online_users",
      Object.keys(onlineUsers).filter((u) => onlineUsers[u])
    );
  });

  socket.on("chat_message", async (msg) => {
    const saved = await Message.create(msg);
    io.to(msg.receiverId).emit("chat_message", saved);
    io.to(msg.senderId).emit("chat_message", saved);
    io.to(msg.receiverId).emit("new_message", saved); // Notification for receiver
  });
});

server.listen(3001, () => console.log("Chat server running on port 3001"));
