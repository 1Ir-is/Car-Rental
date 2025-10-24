const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

router.get("/all", async (req, res) => {
  const me = req.user;
  if (!me || me.role?.toLowerCase() !== "owner") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const convs = await Conversation.find().lean();

    const convsWithLast = await Promise.all(
      convs.map(async (c) => {
        const last = await Message.findOne({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...c,
          lastMessage: last || null,
        };
      })
    );

    // ✅ Sort theo tin nhắn gần nhất
    convsWithLast.sort((a, b) => {
      return (
        new Date(b?.lastMessage?.createdAt || 0) -
        new Date(a?.lastMessage?.createdAt || 0)
      );
    });

    res.json({ success: true, data: convsWithLast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Normal user: get conversations involving themselves
router.get("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const convs = await Conversation.find({
      "participants.userId": userId,
    }).lean();

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

// ✅ Create conversation (User only)
router.post("/", async (req, res) => {
  const me = req.user;
  if (!me?.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  // ✅ Owner không được tự tạo conversation
  if (me.role === "OWNER") {
    return res.status(400).json({
      success: false,
      message: "Owner cannot create conversation manually",
    });
  }

  const { owner, vehicleId } = req.body;
  if (!owner?.id)
    return res.status(400).json({ success: false, message: "owner required" });

  try {
    const existing = await Conversation.findOne({
      vehicleId: vehicleId !== undefined ? String(vehicleId) : null,
      participants: {
        $size: 2,
        $all: [
          { $elemMatch: { userId: String(me.id) } },
          { $elemMatch: { userId: String(owner.id) } },
        ],
      },
    });
    if (existing) return res.json({ success: true, data: existing });

    const conv = await Conversation.create({
      participants: [
        {
          userId: me.id,
          name: me.name,
          avatar: me.avatar,
          role: me.role,
        },
        {
          userId: owner.id,
          name: owner.name,
          avatar: owner.avatar,
          role: owner.role,
        },
      ],
      vehicleId: vehicleId || null,
    });

    res.json({ success: true, data: conv });
  } catch (err) {
    console.error("Error POST /conversations:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get conversation details + messages
router.get("/:id", async (req, res) => {
  const userId = req.user?.id;
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const convId = req.params.id;
  try {
    const conv = await Conversation.findById(convId).lean();
    if (!conv)
      return res.status(404).json({ success: false, message: "Not found" });

    // ✅ Owner có thể xem bất kỳ conversation nào
    if (
      req.user.role !== "OWNER" &&
      !conv.participants.some((p) => String(p.userId) === String(userId))
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const messages = await Message.find({ conversationId: convId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, data: { conversation: conv, messages } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
