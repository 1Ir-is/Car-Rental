const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// send message (persist)
router.post("/", async (req, res) => {
  const me = req.user;
  if (!me.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { conversationId, content, meta } = req.body;
  if (!conversationId || !content)
    return res.status(400).json({ success: false, message: "Missing" });

  try {
    const msg = await Message.create({
      conversationId,
      senderId: me.id,
      content,
      meta,
      createdAt: new Date(),
      readBy: [me.id],
    });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// mark messages read
// mark messages read
router.post("/read", async (req, res) => {
  const me = req.user;
  const { conversationId } = req.body;
  if (!me.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    await Message.updateMany(
      { conversationId, readBy: { $ne: me.id } },
      { $push: { readBy: me.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
