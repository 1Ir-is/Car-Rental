const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  meta: { type: Object, default: {} }, // e.g. type: 'text'|'image'
  readBy: [String], // userIds who have read
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
