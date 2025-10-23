const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [
    {
      userId: String,
      name: String,
      email: String,
      avatar: String,
      role: String,
    },
  ],
  vehicleId: String, // context: which vehicle this conversation belongs to
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ConversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
