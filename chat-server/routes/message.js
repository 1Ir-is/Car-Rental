const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Cloudinary & Multer setup
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const fetch = require("node-fetch");

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

const uploadFile = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max, đổi tùy bạn
  fileFilter: (req, file, cb) => {
    // Chặn file nguy hiểm nếu muốn, ví dụ chỉ cho .pdf, .docx, .zip, ...
    cb(null, true);
  },
});

const MAX_IMAGES_PER_CONVERSATION = 20;

// Gửi message text thường
router.post("/", async (req, res) => {
  const me = req.user;

  if (!me.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const { conversationId, content, meta, replyTo } = req.body;
  if (!conversationId || !content)
    return res.status(400).json({ success: false, message: "Missing" });

  try {
    const msg = await Message.create({
      conversationId,
      senderId: me.id,
      content,
      meta,
      replyTo: replyTo || null, // <--- LƯU replyTo
      createdAt: new Date(),
      readBy: [me.id],
    });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/download", async (req, res) => {
  const { url, name } = req.query;
  if (!url || !name) return res.status(400).send("Missing params");

  try {
    const resp = await fetch(url);
    if (!resp.ok) return res.status(400).send("Cannot fetch file");

    // Đảm bảo header này có charset UTF-8
    res.setHeader(
      "Content-Type",
      resp.headers.get("content-type") || "application/octet-stream"
    );
    // Sử dụng encodeURIComponent cho filename* (chuẩn RFC 5987) để hỗ trợ tiếng Việt và ký tự đặc biệt:
    const fileNameAscii = name.replace(/[^\x00-\x7F]/g, "_"); // fallback cho filename= (ascii)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileNameAscii}"; filename*=UTF-8''${encodeURIComponent(
        name
      )}`
    );

    resp.body.pipe(res);
  } catch (err) {
    res.status(500).send("Download failed");
  }
});

// Thả hoặc bỏ react cho 1 message
router.post("/react", async (req, res) => {
  // Lấy dữ liệu
  const { messageId, emoji } = req.body;
  const me = req.user;
  if (!me.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!messageId || !emoji)
    return res.status(400).json({ success: false, message: "Missing" });

  try {
    // Kiểm tra đã react chưa
    const msg = await Message.findById(messageId);
    const existed = msg.reactions?.find(
      (r) => r.userId === me.id && r.emoji === emoji
    );

    let newMsg;
    if (existed) {
      // Nếu đã react thì xóa react này
      newMsg = await Message.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { emoji, userId: me.id } } },
        { new: true }
      );
    } else {
      // Thêm react
      newMsg = await Message.findByIdAndUpdate(
        messageId,
        { $push: { reactions: { emoji, userId: me.id } } },
        { new: true }
      );
    }
    // Trả về message mới có trường reactions cập nhật
    res.json({ success: true, data: newMsg });
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

// Upload file thường (Cloudinary hoặc local, hoặc S3)
router.post("/upload-file", uploadFile.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Missing file." });
  }
  try {
    // Nếu dùng Cloudinary: resource_type: "raw"
    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_files",
            resource_type: "raw", // file thường
            use_filename: true,
            unique_filename: true,
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
    return res.json({
      success: true,
      url: result.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    });
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
