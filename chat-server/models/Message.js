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
  image: { type: String }, // 1 ảnh (giữ cho tương thích cũ)
  images: [{ type: String }], // nhiều ảnh (mới)
  meta: { type: Object, default: {} },
  readBy: [String],
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
