const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Cloudinary & Multer setup
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// CLOUDINARY config
cloudinary.config({
  cloud_name: "dnrxauvuu",
  api_key: "413839991841514",
  api_secret: "1nTDYBnVtoMe6AzXGK1z52gFhjg",
});

// Multer config: memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

const MAX_IMAGES_PER_CONVERSATION = 20;

// Gửi message text thường
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

router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Thiếu file." });
  }
  try {
    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_images",
            resource_type: "image",
            transformation: [{ width: 1000, quality: "auto" }],
            // use_filename: true,           // BỎ hoặc để true
            // unique_filename: true,        // Để true hoặc bỏ dòng này
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);
    return res.json({ success: true, url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

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
