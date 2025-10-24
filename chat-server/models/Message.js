const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: { type: String, required: true },
  content: { type: String },
  image: { type: String },
  images: [{ type: String }],
  file: {
    url: { type: String },
    name: { type: String },
    type: { type: String },
    size: { type: Number },
  },
  reactions: [
    {
      emoji: { type: String }, // VD: "👍", "😂"
      userId: { type: String }, // Ai thả
    },
  ],
  replyTo: { type: String, default: null }, // <-- thêm dòng này
  meta: { type: Object, default: {} },
  readBy: [String],
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
