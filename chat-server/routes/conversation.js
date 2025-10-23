const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// get all conversations for current user
router.get("/", async (req, res) => {
  const userId = req.user.id;
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const convs = await Conversation.find({
      "participants.userId": userId,
    }).lean();
    // for convenience, include last message timestamp or last message
    const convsWithLast = await Promise.all(
      convs.map(async (c) => {
        const last = await Message.findOne({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .lean();
        return { ...c, lastMessage: last || null };
      })
    );
    res.json({ success: true, data: convsWithLast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  const me = req.user;
  if (!me.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { owner, vehicleId } = req.body;
  if (!owner || !owner.id)
    return res.status(400).json({ success: false, message: "owner required" });

  try {
    const participantsSet = [me.id, owner.id];
    const existing = await Conversation.findOne({
      vehicleId: vehicleId || null,
      participants: {
        $size: 2,
        $all: [
          { $elemMatch: { userId: me.id } },
          { $elemMatch: { userId: owner.id } },
        ],
      },
    });

    if (existing) return res.json({ success: true, data: existing });

    // Lưu đủ trường
    const conv = await Conversation.create({
      participants: [
        {
          userId: me.id,
          name: me.name || "",
          avatar: me.avatar || "",
          email: me.email || "",
          role: me.role || "user",
        },
        {
          userId: owner.id,
          name: owner.name || "",
          avatar: owner.avatar || "",
          email: owner.email || "",
          role: owner.role || "owner",
        },
      ],
      vehicleId: vehicleId || null,
    });

    res.json({ success: true, data: conv });
  } catch (err) {
    console.error("Error in POST /api/conversations:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// get single conversation with messages (pagination)
router.get("/:id", async (req, res) => {
  const userId = req.user.id;
  const convId = req.params.id;
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const conv = await Conversation.findById(convId).lean();
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found" });
    // check participant
    if (!conv.participants.some((p) => p.userId === userId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const messages = await Message.find({ conversationId: convId })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, data: { conversation: conv, messages } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
