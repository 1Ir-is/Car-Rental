import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import dayjs from "dayjs";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  Divider,
  Card,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
  PictureOutlined,
  PaperClipOutlined,
  SmileOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import Picker from "@emoji-mart/react"; // chú ý @emoji-mart/react
import data from "@emoji-mart/data"; // cần thêm data
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const { Sider, Content } = Layout;
const { Text } = Typography;

const API = process.env.REACT_APP_CHAT_API || "http://localhost:5000/api";
const SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET || "http://localhost:5000";
let socket;

function ChatBox({ open, onClose, openWithOwner, currentUser }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // [{file, url}]
  const [uploadError, setUploadError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const audioRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null); // Tin nhắn đang được reply
  const [actionMenuMsgId, setActionMenuMsgId] = useState(null); // Để hiển thị menu 3 chấm của bubble nào
  const [showReactionPicker, setShowReactionPicker] = useState(null);

  function handleImageChange(e) {
    const MAX_IMAGES = 10;
    const files = Array.from(e.target.files);

    // Nếu đã đủ 10 ảnh thì không cho chọn nữa, báo lỗi
    if (selectedImages.length >= MAX_IMAGES) {
      setUploadError(`You can only select up to ${MAX_IMAGES} images.`);
      e.target.value = "";
      return;
    }

    // Nếu số lượng ảnh muốn chọn vượt quá MAX_IMAGES
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setUploadError(`You can only send up to ${MAX_IMAGES} images at a time.`);
    } else {
      setUploadError("");
    }

    // Chỉ lấy vừa đủ số còn thiếu
    const newFiles = files.slice(0, MAX_IMAGES - selectedImages.length);
    for (const file of newFiles) {
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Image exceeds the maximum size of 2MB.");
        continue;
      }
      setSelectedImages((prev) => [
        ...prev,
        { file, url: URL.createObjectURL(file) },
      ]);
    }
    e.target.value = "";
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File exceeds the maximum size of 15MB.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setUploadError("");
    e.target.value = "";
  }

  function removePreviewImage(idx) {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    if (
      (!text.trim() && selectedImages.length === 0 && !selectedFile) ||
      !activeConv
    )
      return;
    setUploading(true);

    let imageUrls = [];
    let filePayload = null;

    // UPLOAD ẢNH (nếu có)
    if (selectedImages.length > 0) {
      const uploadPromises = selectedImages.map((img) => {
        const form = new FormData();
        form.append("image", img.file, img.file.name);
        form.append("conversationId", activeConv._id);
        form.append("senderId", currentUser.id);
        return axios.post(`${API}/messages/upload-image`, form, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
      });

      try {
        const results = await Promise.all(uploadPromises);
        for (const res of results) {
          if (res.data.success && res.data.url) {
            imageUrls.push(res.data.url);
          }
        }
        if (imageUrls.length !== selectedImages.length) {
          setUploadError("Some images failed to send.");
          setUploading(false);
          return;
        }
      } catch (err) {
        setUploadError("An error occurred while uploading images.");
        setUploading(false);
        return;
      }
    }

    // UPLOAD FILE (nếu có)
    if (selectedFile) {
      try {
        const form = new FormData();
        form.append("file", selectedFile, selectedFile.name);
        form.append("conversationId", activeConv._id);
        form.append("senderId", currentUser.id);
        const res = await axios.post(`${API}/messages/upload-file`, form, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.data.success && res.data.url) {
          filePayload = {
            url: res.data.url,
            name: res.data.fileName,
            type: res.data.fileType,
            size: res.data.size,
          };
        } else {
          setUploadError("File upload failed.");
          setUploading(false);
          return;
        }
      } catch (err) {
        setUploadError("An error occurred while uploading file.");
        setUploading(false);
        return;
      }
    }

    // CHỈ PUSH VÀO messages KHI filePayload đã có dữ liệu (sau khi upload xong)
    if (imageUrls.length > 0 || filePayload || text.trim()) {
      const payload = {
        conversationId: activeConv._id,
        senderId: currentUser.id,
        content: text.trim(),
        images: imageUrls,
        file: filePayload,
        replyTo: replyingMessage ? replyingMessage._id : undefined, // <-- thêm dòng này
      };

      socket.emit("message:send", payload);
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          createdAt: new Date().toISOString(),
          _id: `tmp-${Date.now()}`,
        },
      ]);
    }

    setText("");
    setSelectedImages([]);
    setSelectedFile(null);
    setUploading(false);
    setReplyingMessage(null); // <-- DÒNG NÀY QUAN TRỌNG: TẮT PREVIEW REPLY
    scrollToBottom();
  }

  // Thêm emoji vào input text
  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji.native);
    setShowEmoji(false);
  };
  // Xóa conversation đã đọc khỏi localStorage (dùng khi có message mới đến)
  const removeReadConv = (convId) => {
    const prev = getReadConvs();
    if (prev.includes(convId)) {
      localStorage.setItem(
        READ_CONV_KEY,
        JSON.stringify(prev.filter((id) => id !== convId))
      );
    }
  };
  // Lưu các conversation đã đọc vào localStorage
  const READ_CONV_KEY = `read_conversations_${currentUser?.id}`;
  const getReadConvs = () => {
    try {
      return JSON.parse(localStorage.getItem(READ_CONV_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const addReadConv = (convId) => {
    const prev = getReadConvs();
    if (!prev.includes(convId)) {
      localStorage.setItem(READ_CONV_KEY, JSON.stringify([...prev, convId]));
    }
  };
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const joinedConvRef = useRef(null);

  const myRole =
    typeof currentUser?.role === "string"
      ? currentUser.role.toLowerCase()
      : (currentUser?.role?.name || "").toLowerCase();

  const headers = {
    "x-user-id": currentUser?.id,
    "x-user-name": encodeURIComponent(currentUser?.name || ""),
    "x-user-avatar": currentUser?.avatar,
    "x-user-role": myRole || "user",
  };

  const getOtherUser = (conv) => {
    // Luôn lấy participant khác currentUser
    return conv?.participants?.find(
      (p) => String(p.userId) !== String(currentUser?.id)
    );
  };

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    }
    if (currentUser?.id) socket.emit("user:online", currentUser.id);
    const onMessageReceive = (msg) => {
      if (msg.senderId !== currentUser.id) {
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        if (!open) {
          window.dispatchEvent(new Event("chat-new-message"));
        }
        removeReadConv(msg.conversationId);
      }
      setConversations((prev) =>
        prev.map((conv) => {
          if (String(conv._id) === String(msg.conversationId)) {
            return { ...conv, lastMessage: msg };
          }
          return conv;
        })
      );
      setTimeout(fetchConversations, 400);
      if (activeConv && String(msg.conversationId) === String(activeConv._id)) {
        fetchConversationDetail(msg.conversationId);
        scrollToBottom();
      }
    };

    socket.on("message:receive", onMessageReceive);
    return () => {
      socket.off("message:receive", onMessageReceive);
    };
  }, [currentUser, activeConv]);

  useEffect(() => {
    if (!activeConv) return;
    let timeout;
    if (
      typingUsers[activeConv._id] &&
      typingUsers[activeConv._id] !== currentUser.id
    ) {
      timeout = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [activeConv._id]: null }));
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [typingUsers, activeConv, currentUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on("typing", ({ conversationId, userId, typing }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: typing ? userId : null,
      }));
    });
    return () => socket.off("typing");
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("message:reaction-update", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    });
    return () => socket.off("message:reaction-update");
  }, []);

  useEffect(() => {
    socket.on("conversation:update", () => {
      fetchConversations();
    });
    return () => socket.off("conversation:update");
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("message:unsend", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, deletedForEveryone: true } : msg
        )
      );
    });
    return () => socket.off("message:unsend");
  }, []);

  useEffect(() => {
    if (open) {
      fetchConversations();
      if (openWithOwner) createOrGetConversation(openWithOwner);
      if (activeConv && socket) {
        socket.emit("join:conversation", String(activeConv._id));
        joinedConvRef.current = activeConv._id;
      }
    }
  }, [open, openWithOwner]);

  useEffect(() => {
    if (!open || !activeConv) return;
    if (socket) {
      socket.emit("join:conversation", String(activeConv._id));
      joinedConvRef.current = activeConv._id;
    }
    fetchConversationDetail(activeConv._id);
    return () => {
      if (socket && joinedConvRef.current) {
        socket.emit("leave:conversation", String(joinedConvRef.current));
        joinedConvRef.current = null;
      }
    };
  }, [open, activeConv]);

  function scrollToBottom() {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  async function fetchConversations() {
    try {
      let url = `${API}/conversations`;
      if (currentUser?.role === "OWNER") {
        url = `${API}/conversations/all`;
      }
      const res = await axios.get(url, { headers });
      if (res.data.success) {
        // Lấy danh sách đã đọc từ localStorage
        const readConvs = getReadConvs();
        const newConvs = res.data.data.map((c) => {
          // Nếu là lastMessage mình gửi, LUÔN ép readBy chứa currentUser.id
          if (
            c.lastMessage &&
            c.lastMessage.senderId === currentUser.id &&
            !c.lastMessage.readBy?.includes(currentUser.id)
          ) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                readBy: [...(c.lastMessage.readBy || []), currentUser.id],
              },
            };
          }
          // Nếu là đã từng đọc (localStorage), ép readBy như cũ
          if (
            c.lastMessage &&
            getReadConvs().includes(c._id) &&
            !c.lastMessage.readBy?.includes(currentUser.id)
          ) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                readBy: [...(c.lastMessage.readBy || []), currentUser.id],
              },
            };
          }
          return c;
        });
        setConversations(newConvs);
        setConversations(newConvs);
        // Join ALL conversations để nhận socket event cho mọi room
        if (socket) {
          newConvs.forEach((conv) => {
            socket.emit("join:conversation", String(conv._id));
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function createOrGetConversation(ownerInfo) {
    if (currentUser?.role === "OWNER") return;
    try {
      let found = conversations.find(
        (c) =>
          String(c.vehicleId || "") === String(ownerInfo.vehicleId || "") &&
          c.participants.some((p) => String(p.userId) === String(ownerInfo.id))
      );
      if (found) {
        setActiveConv(found);
        return;
      }
      // Khi gọi API, truyền vehicleId chuẩn:
      const vehicleIdSafe = ownerInfo.vehicleId
        ? String(ownerInfo.vehicleId)
        : null;
      const res = await axios.post(
        `${API}/conversations`,
        { owner: ownerInfo, vehicleId: vehicleIdSafe },
        { headers }
      );
      if (res.data.success) {
        setActiveConv(res.data.data);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchConversationDetail(convId) {
    try {
      const res = await axios.get(`${API}/conversations/${convId}`, {
        headers,
      });
      if (res.data.success) {
        setMessages(res.data.data.messages || []);
        scrollToBottom();

        // Gọi API mark as read
        await axios.post(
          `${API}/messages/read`,
          { conversationId: convId },
          { headers }
        );
        // Sau khi mark as read xong, fetch lại conversations để cập nhật sidebar
        await fetchConversations();

        // Nếu lastMessage đã có readBy chứa currentUser.id thì thêm lại vào localStorage
        const lastMsg =
          res.data.data.messages && res.data.data.messages.length > 0
            ? res.data.data.messages[res.data.data.messages.length - 1]
            : null;
        // fetchConversationDetail (sau khi mark as read)
        if (
          lastMsg &&
          lastMsg.readBy &&
          lastMsg.readBy.includes(currentUser.id)
        ) {
          addReadConv(convId);
        }
      }
    } catch (err) {
      console.error("Error in fetchConversationDetail:", err);
    }
  }

  function onTyping(e) {
    setText(e.target.value);
    if (!activeConv) return;
    socket.emit("typing", {
      conversationId: activeConv._id,
      userId: currentUser.id,
      typing: !!e.target.value,
    });

    // Nếu lastMessage chưa đọc, update local conversations
    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConv._id &&
        c.lastMessage &&
        !c.lastMessage.readBy?.includes(currentUser.id)
          ? {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                readBy: [...(c.lastMessage.readBy || []), currentUser.id],
              },
            }
          : c
      )
    );
  }
  function onInputBlur() {
    if (!activeConv) return;
    socket.emit("typing", {
      conversationId: activeConv._id,
      userId: currentUser.id,
      typing: false,
    });
  }
  if (!open) return null;

  // Filter conversations by search
  const filteredConvs = conversations.filter((conv, idx, arr) => {
    return (
      arr.findIndex(
        (c) =>
          String(c.vehicleId || "") === String(conv.vehicleId || "") &&
          c.participants.length === conv.participants.length &&
          c.participants.every(
            (p, i) => String(p.userId) === String(conv.participants[i].userId)
          )
      ) === idx
    );
  });

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      <Card
        style={{
          width: 900,
          height: 600,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 6px 24px #0002",
          padding: 0,
        }}
        styles={{ body: { padding: 0, height: "100%" } }}
      >
        <Layout style={{ height: "100%", background: "#fff" }}>
          <Sider
            width={320}
            style={{
              background: "#f7f7f7",
              borderRight: "1px solid #eee",
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text strong style={{ fontSize: 18 }}>
                <MessageOutlined /> Chat
              </Text>
              <Tooltip title="Close">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={onClose}
                />
              </Tooltip>
            </div>
            <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <Input.Search
                placeholder="Search by name..."
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: 20 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <List
                itemLayout="horizontal"
                dataSource={filteredConvs}
                renderItem={(conv) => {
                  const other = getOtherUser(conv);
                  // Giải mã tên nếu bị encode
                  let displayName = other?.name || "Người dùng";
                  try {
                    displayName = decodeURIComponent(displayName);
                  } catch {}
                  // Kiểm tra nếu lastMessage chưa đọc và KHÔNG phải do mình gửi
                  const isUnread =
                    conv.lastMessage &&
                    !conv.lastMessage.readBy?.includes(currentUser.id) &&
                    conv.lastMessage.senderId !== currentUser.id;
                  return (
                    <List.Item
                      style={{
                        background:
                          activeConv &&
                          String(activeConv._id) === String(conv._id)
                            ? "#e6f7ff"
                            : "transparent",
                        cursor: "pointer",
                        paddingLeft: 12,
                        borderLeft:
                          activeConv &&
                          String(activeConv._id) === String(conv._id)
                            ? "4px solid #1890ff"
                            : "4px solid transparent",
                        transition: "background 0.2s, border 0.2s",
                      }}
                      onClick={() => {
                        setActiveConv(conv);
                        // Đánh dấu đã đọc ngay lập tức ở local state và localStorage
                        setConversations((prev) =>
                          prev.map((c) =>
                            c._id === conv._id &&
                            c.lastMessage &&
                            !c.lastMessage.readBy?.includes(currentUser.id)
                              ? {
                                  ...c,
                                  lastMessage: {
                                    ...c.lastMessage,
                                    readBy: [
                                      ...(c.lastMessage.readBy || []),
                                      currentUser.id,
                                    ],
                                  },
                                }
                              : c
                          )
                        );
                        addReadConv(conv._id);
                        fetchConversationDetail(conv._id).then(() => {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c._id === conv._id &&
                              c.lastMessage &&
                              !c.lastMessage.readBy?.includes(currentUser.id)
                                ? {
                                    ...c,
                                    lastMessage: {
                                      ...c.lastMessage,
                                      readBy: [
                                        ...(c.lastMessage.readBy || []),
                                        currentUser.id,
                                      ],
                                    },
                                  }
                                : c
                            )
                          );
                          addReadConv(conv._id);
                        });
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<UserOutlined />} src={other?.avatar} />
                        }
                        title={<Text strong>{displayName}</Text>}
                        description={
                          <span
                            style={{
                              fontSize: 13,
                              color: isUnread ? "#222" : "#888",
                              fontWeight: isUnread ? 700 : 400,
                              display: "block",
                              maxWidth: 170,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {conv.lastMessage
                              ? conv.lastMessage.images &&
                                conv.lastMessage.images.length > 0
                                ? // Nhiều ảnh
                                  `${
                                    String(conv.lastMessage.senderId) ===
                                    String(currentUser.id)
                                      ? "You"
                                      : (() => {
                                          let name = "";
                                          try {
                                            name = decodeURIComponent(
                                              conv.participants?.find(
                                                (p) =>
                                                  String(p.userId) ===
                                                  String(
                                                    conv.lastMessage.senderId
                                                  )
                                              )?.name || "User"
                                            );
                                          } catch {
                                            name =
                                              conv.participants?.find(
                                                (p) =>
                                                  String(p.userId) ===
                                                  String(
                                                    conv.lastMessage.senderId
                                                  )
                                              )?.name || "User";
                                          }
                                          return name;
                                        })()
                                  } sent ${
                                    conv.lastMessage.images.length
                                  } photos`
                                : conv.lastMessage.image
                                ? // 1 ảnh
                                  `${
                                    String(conv.lastMessage.senderId) ===
                                    String(currentUser.id)
                                      ? "You"
                                      : (() => {
                                          let name = "";
                                          try {
                                            name = decodeURIComponent(
                                              conv.participants?.find(
                                                (p) =>
                                                  String(p.userId) ===
                                                  String(
                                                    conv.lastMessage.senderId
                                                  )
                                              )?.name || "User"
                                            );
                                          } catch {
                                            name =
                                              conv.participants?.find(
                                                (p) =>
                                                  String(p.userId) ===
                                                  String(
                                                    conv.lastMessage.senderId
                                                  )
                                              )?.name || "User";
                                          }
                                          return name;
                                        })()
                                  } sent 1 photo`
                                : conv.lastMessage.file
                                ? // ==== FILE ở đây ====
                                  String(conv.lastMessage.senderId) ===
                                  String(currentUser.id)
                                  ? "You sent a file"
                                  : (() => {
                                      let name = "";
                                      try {
                                        name = decodeURIComponent(
                                          conv.participants?.find(
                                            (p) =>
                                              String(p.userId) ===
                                              String(conv.lastMessage.senderId)
                                          )?.name || "User"
                                        );
                                      } catch {
                                        name =
                                          conv.participants?.find(
                                            (p) =>
                                              String(p.userId) ===
                                              String(conv.lastMessage.senderId)
                                          )?.name || "User";
                                      }
                                      return `${name} sent a file`;
                                    })()
                                : conv.lastMessage.content
                                ? // Tin nhắn text
                                  conv.lastMessage.content
                                : // Mặc định
                                  "Click to open the conversation"
                              : // Nếu chưa có lastMessage
                                "Click to open the conversation"}
                          </span>
                        }
                      />
                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                          minWidth: 48,
                          textAlign: "right",
                          paddingRight: 16,
                          fontWeight: isUnread ? 700 : 400,
                        }}
                      >
                        {conv.lastMessage
                          ? dayjs(conv.lastMessage.createdAt).format("HH:mm")
                          : ""}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Sider>
          <Layout>
            <Content
              style={{
                padding: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {!activeConv ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <Text strong style={{ fontSize: 22 }}>
                    Chào mừng bạn đến với Chat
                  </Text>
                  <Text type="secondary">
                    Select a conversation or click “Chat with Owner”.
                  </Text>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: 20,
                      borderBottom: "1px solid #eee",
                      background: "#fafcff",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {(() => {
                      const other = getOtherUser(activeConv);
                      let displayName = other?.name || "";
                      try {
                        displayName = decodeURIComponent(displayName);
                      } catch {}
                      return (
                        <>
                          <Avatar
                            size={44}
                            icon={<UserOutlined />}
                            src={other?.avatar}
                          />
                          <div>
                            <Text strong style={{ fontSize: 17 }}>
                              {displayName}
                            </Text>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: 24,
                      background: "#f9fafd",
                    }}
                  >
                    <List
                      dataSource={
                        uploading
                          ? [
                              ...messages,
                              {
                                _id: "uploading-spinner",
                                senderId: currentUser.id,
                                uploading: true,
                              },
                            ]
                          : messages
                      }
                      renderItem={(m) => {
                        // ...existing code for normal message bubble...
                        const isMe =
                          String(m.senderId) === String(currentUser.id);
                        const other = getOtherUser(activeConv);
                        return m.deletedForEveryone ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                              marginBottom: 12,
                            }}
                          >
                            <i
                              style={{
                                color: "#888",
                                fontStyle: "italic",
                                padding: 8,
                                borderRadius: 12,
                                background: "#f7f7f7",
                              }}
                            >
                              Tin nhắn đã được thu hồi
                            </i>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                              marginBottom: 12,
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: isMe
                                  ? "flex-end"
                                  : "flex-start",
                                alignItems: "flex-end",
                              }}
                            >
                              {!isMe && (
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={other?.avatar}
                                  style={{ marginRight: 8 }}
                                />
                              )}
                              <div
                                style={{
                                  background: isMe ? "#e6f7ff" : "#fff",
                                  color: "#222",
                                  borderRadius: 16,
                                  padding: "10px 18px",
                                  maxWidth: 320,
                                  boxShadow: isMe
                                    ? "0 1px 6px #91d5ff33"
                                    : "0 1px 6px #eee",
                                  textAlign: isMe ? "right" : "left",
                                  fontSize: 15,
                                  wordBreak: "break-word",
                                  position: "relative",
                                }}
                              >
                                {m.replyTo && (
                                  <div
                                    style={{
                                      borderLeft: "3px solid #1877f2",
                                      background: "#f0f4fa",
                                      borderRadius: 6,
                                      padding: "5px 10px",
                                      marginBottom: 5,
                                      color: "#444",
                                      maxWidth: 220,
                                      fontSize: 13,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {(() => {
                                      const repliedMsg = messages.find(
                                        (msg) => msg._id === m.replyTo
                                      );
                                      if (!repliedMsg)
                                        return "(Message deleted)";
                                      // === LẤY TÊN NGƯỜI GỬI GỐC ===
                                      let senderName = "";
                                      if (
                                        String(repliedMsg.senderId) ===
                                        String(currentUser.id)
                                      ) {
                                        senderName = "You";
                                      } else {
                                        // CHÚ Ý: activeConv phải có participants
                                        const participant =
                                          activeConv?.participants?.find(
                                            (p) =>
                                              String(p.userId) ===
                                              String(repliedMsg.senderId)
                                          );
                                        if (participant) {
                                          try {
                                            senderName = decodeURIComponent(
                                              participant.name || "Unknown"
                                            );
                                          } catch {
                                            senderName =
                                              participant.name || "Unknown";
                                          }
                                        } else {
                                          senderName = "(Unknown)";
                                          // GỢI Ý: Log participant danh sách để debug
                                          // console.log('participants:', activeConv?.participants, 'senderId:', repliedMsg.senderId);
                                        }
                                      }

                                      let replyContent = "";
                                      if (repliedMsg.content)
                                        replyContent = repliedMsg.content;
                                      else if (repliedMsg.images?.length)
                                        replyContent = "Image";
                                      else if (repliedMsg.file)
                                        replyContent = `[File] ${repliedMsg.file.name}`;
                                      else replyContent = "Attachment";
                                      return (
                                        <>
                                          <span
                                            style={{
                                              fontWeight: 600,
                                              color: "#1877f2",
                                            }}
                                          >
                                            {senderName}
                                          </span>
                                          <br />
                                          <span>{replyContent}</span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}

                                {/* Bubble image(s) */}
                                {m.images && m.images.length > 0 && (
                                  <div
                                    style={{ marginBottom: m.content ? 8 : 0 }}
                                  >
                                    <div
                                      style={{
                                        position: "relative",
                                        width:
                                          120 +
                                          Math.min(m.images.length - 1, 3) * 32,
                                        height: 120,
                                        margin: "8px 0",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {m.images
                                        .slice(0, 4)
                                        .map((imgUrl, idx) => (
                                          <img
                                            key={idx}
                                            src={imgUrl}
                                            alt=""
                                            style={{
                                              position: "absolute",
                                              left: idx * 32,
                                              top: 0,
                                              width: 120,
                                              height: 120,
                                              objectFit: "cover",
                                              borderRadius: 24,
                                              boxShadow: "0 2px 12px #d3e3f5cc",
                                              border: "3px solid #fff",
                                              zIndex: idx,
                                              background: "#f0f0f0",
                                              cursor: "pointer",
                                            }}
                                            onClick={() => {
                                              setLightboxImages(
                                                m.images.map((src) => ({ src }))
                                              );
                                              setLightboxIndex(idx);
                                              setLightboxOpen(true);
                                            }}
                                          />
                                        ))}
                                      {m.images.length > 4 && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: 3 * 32,
                                            top: 0,
                                            width: 120,
                                            height: 120,
                                            borderRadius: 24,
                                            background: "rgba(0,0,0,0.7)",
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: 28,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 100,
                                            pointerEvents: "none",
                                            boxShadow: "0 2px 12px #d3e3f5cc",
                                          }}
                                        >
                                          +{m.images.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {m.image && (
                                  <img
                                    src={m.image}
                                    alt="img"
                                    style={{
                                      maxWidth: 200,
                                      maxHeight: 200,
                                      borderRadius: 8,
                                      marginBottom: m.content ? 6 : 0,
                                      display: "block",
                                      cursor: "pointer",
                                      boxShadow: "0 2px 12px #d3e3f5cc",
                                      border: "3px solid #fff",
                                    }}
                                    onClick={() => {
                                      setLightboxImages([{ src: m.image }]);
                                      setLightboxIndex(0);
                                      setLightboxOpen(true);
                                    }}
                                  />
                                )}

                                {/* ==== ĐÂY LÀ ĐOẠN HIỂN THỊ FILE ==== */}
                                {m.file && (
                                  <div style={{ marginBottom: 8 }}>
                                    <a
                                      href={`${API}/messages/download?url=${encodeURIComponent(
                                        m.file.url
                                      )}&name=${encodeURIComponent(
                                        m.file.name
                                      )}`}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "#1890ff",
                                        textDecoration: "underline",
                                        gap: 8,
                                        fontWeight: 500,
                                        wordBreak: "break-all",
                                      }}
                                      download
                                    >
                                      <PaperClipOutlined /> {m.file.name}
                                      <span
                                        style={{ fontSize: 12, color: "#888" }}
                                      >
                                        ({(m.file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </a>
                                  </div>
                                )}

                                {/* Nút 3 chấm + actions */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    left: isMe ? -36 : "unset",
                                    right: isMe ? "unset" : -36,
                                    display: "flex",
                                    alignItems: "center",
                                    opacity: 0.7,
                                    zIndex: 2,
                                  }}
                                >
                                  <Button
                                    icon={
                                      <span style={{ fontSize: 20 }}>⋯</span>
                                    }
                                    shape="circle"
                                    size="small"
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                    }}
                                    onClick={() => setActionMenuMsgId(m._id)}
                                  />
                                  {actionMenuMsgId === m._id && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        right: isMe ? "unset" : 36,
                                        left: isMe ? 36 : "unset",
                                        background: "#fff",
                                        boxShadow: "0 4px 16px #0002",
                                        borderRadius: 10,
                                        zIndex: 10,
                                        minWidth: 120,
                                        padding: "6px 0",
                                        transition: "all 0.15s",
                                        transform: isMe
                                          ? "translateX(-100%)"
                                          : "translateX(100%)",
                                      }}
                                      onMouseLeave={() =>
                                        setActionMenuMsgId(null)
                                      }
                                    >
                                      <Button
                                        type="text"
                                        block
                                        onClick={() => {
                                          setReplyingMessage(m);
                                          setActionMenuMsgId(null);
                                        }}
                                      >
                                        Reply
                                      </Button>
                                      <Button
                                        type="text"
                                        block
                                        onClick={() => {
                                          setShowReactionPicker(m._id);
                                          setActionMenuMsgId(null);
                                        }}
                                      >
                                        React
                                      </Button>
                                      {isMe && (
                                        <Button
                                          type="text"
                                          block
                                          danger
                                          onClick={async () => {
                                            await axios.post(
                                              `${API}/messages/unsend`,
                                              { messageId: m._id },
                                              { headers }
                                            );
                                            setActionMenuMsgId(null);
                                          }}
                                        >
                                          Unsend
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {m.content}

                                {/* Thanh emoji ngang – luôn render phía trên bubble */}
                                {showReactionPicker === m._id && (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      gap: 10,
                                      background: "#fff",
                                      boxShadow: "0 6px 32px #0002",
                                      borderRadius: 22,
                                      position: "absolute",
                                      left: isMe ? "unset" : 0,
                                      right: isMe ? 0 : "unset",
                                      bottom: "100%", // <-- Đặt phía trên bubble
                                      marginBottom: 8, // <-- Cách bubble 1 chút
                                      padding: "6px 14px",
                                      zIndex: 100,
                                      border: "1.5px solid #e6e6e6",
                                      minWidth: 230,
                                      animation: "fadeIn .15s",
                                    }}
                                    onMouseLeave={() =>
                                      setShowReactionPicker(null)
                                    }
                                  >
                                    {["👍", "❤️", "😂", "😮", "😢", "😡"].map(
                                      (emoji) => (
                                        <span
                                          key={emoji}
                                          style={{
                                            fontSize: 30,
                                            cursor: "pointer",
                                            borderRadius: "50%",
                                            transition: "background .13s",
                                            padding: 3,
                                            userSelect: "none",
                                            border: m.reactions?.some(
                                              (r) =>
                                                r.emoji === emoji &&
                                                r.userId === currentUser.id
                                            )
                                              ? "2px solid #1890ff"
                                              : "2px solid transparent",
                                          }}
                                          onClick={() => {
                                            socket.emit("message:react", {
                                              messageId: m._id,
                                              emoji,
                                              userId: currentUser.id,
                                              conversationId: activeConv._id,
                                            });
                                            setShowReactionPicker(null);
                                          }}
                                        >
                                          {emoji}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                                {m.reactions && m.reactions.length > 0 && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: isMe ? "unset" : 24,
                                      right: isMe ? 24 : "unset",
                                      bottom: -13, // overlap nhẹ lên bubble
                                      display: "flex",
                                      gap: 2,
                                      background: "#fff",
                                      borderRadius: 12,
                                      boxShadow: "0 1px 6px #0001",
                                      padding: "2px 7px",
                                      minHeight: 24,
                                      zIndex: 5,
                                      border: "1px solid #f2f2f2",
                                      alignItems: "center",
                                    }}
                                  >
                                    {[
                                      ...new Set(
                                        m.reactions.map((r) => r.emoji)
                                      ),
                                    ].map((emoji) => {
                                      const count = m.reactions.filter(
                                        (r) => r.emoji === emoji
                                      ).length;
                                      const reactedByMe = m.reactions.some(
                                        (r) =>
                                          r.emoji === emoji &&
                                          r.userId === currentUser.id
                                      );
                                      return (
                                        <span
                                          key={emoji}
                                          style={{
                                            fontSize: 10,
                                            background: reactedByMe
                                              ? "#ffe6ef"
                                              : "none",
                                            borderRadius: 10,
                                            border: reactedByMe
                                              ? "1px solid #e74c3c"
                                              : "none",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            minWidth: 10,
                                            padding: "0 2px",
                                            userSelect: "none",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                          onClick={() => {
                                            socket.emit("message:react", {
                                              messageId: m._id,
                                              emoji,
                                              userId: currentUser.id,
                                              conversationId: activeConv._id,
                                            });
                                          }}
                                        >
                                          {emoji} {count > 1 ? count : ""}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {isMe && (
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={currentUser?.avatar}
                                  style={{ marginLeft: 8 }}
                                />
                              )}
                            </div>

                            <span
                              style={{
                                fontSize: 11,
                                color: "#888",
                                marginTop: 2,
                                marginLeft: isMe ? 0 : 40,
                                marginRight: isMe ? 40 : 0,
                                alignSelf: isMe ? "flex-end" : "flex-start",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dayjs(m.createdAt).format("HH:mm")}
                            </span>
                          </div>
                        );
                      }}
                    />
                    <div ref={messagesEndRef} />
                  </div>
                  {activeConv &&
                    typingUsers[activeConv._id] &&
                    String(typingUsers[activeConv._id]) !==
                      String(currentUser.id) &&
                    (() => {
                      const typingUserObj = activeConv.participants?.find(
                        (p) =>
                          String(p.userId) ===
                          String(typingUsers[activeConv._id])
                      );
                      let typingName = typingUserObj?.name || "Someone";
                      try {
                        typingName = decodeURIComponent(typingName);
                      } catch {}
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "2px 0 4px 12px",
                            fontSize: 16, // Tăng size chữ lên
                            color: "#888",
                            fontStyle: "italic",
                            minHeight: 22,
                            whiteSpace: "nowrap",
                            lineHeight: 1.3,
                            fontWeight: 400,
                          }}
                        >
                          {typingName} is typing
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: 8,
                              letterSpacing: 2,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 8, // Match với fontSize, nên dùng 8px khi chữ 16px
                                height: 8,
                                borderRadius: "50%",
                                background: "#1890ff",
                                margin: "0 2px",
                                animation: "blink-chat 1.1s infinite alternate",
                              }}
                            ></span>
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#1890ff",
                                margin: "0 2px",
                                animation:
                                  "blink-chat 1.1s infinite alternate 0.3s",
                              }}
                            ></span>
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#1890ff",
                                margin: "0 2px",
                                animation:
                                  "blink-chat 1.1s infinite alternate 0.6s",
                              }}
                            ></span>
                          </span>
                        </div>
                      );
                    })()}
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{
                      padding: 16,
                      background: "#fff",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    {replyingMessage && (
                      <div
                        style={{
                          background: "#e8f0fe",
                          borderLeft: "3px solid #1877f2",
                          padding: "8px 12px",
                          marginBottom: 8,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                          minHeight: 38,
                          maxWidth: 420,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: "#1877f2" }}>
                            {String(replyingMessage.senderId) ===
                            String(currentUser.id)
                              ? "You"
                              : (() => {
                                  const participant =
                                    activeConv?.participants?.find(
                                      (p) =>
                                        String(p.userId) ===
                                        String(replyingMessage.senderId)
                                    );
                                  if (!participant) return "Unknown";
                                  try {
                                    return decodeURIComponent(
                                      participant.name || "Unknown"
                                    );
                                  } catch {
                                    return participant.name || "Unknown";
                                  }
                                })()}
                          </span>
                          <br />
                          <span style={{ color: "#444" }}>
                            {replyingMessage.content
                              ? replyingMessage.content
                              : replyingMessage.images?.length
                              ? "Image"
                              : replyingMessage.file
                              ? `[File] ${replyingMessage.file.name}`
                              : "Attachment"}
                          </span>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          style={{
                            color: "#333",
                            position: "absolute",
                            right: 0,
                            top: 0,
                            zIndex: 2,
                          }}
                          onClick={() => setReplyingMessage(null)}
                          icon={<CloseOutlined />}
                        />
                      </div>
                    )}

                    {selectedImages.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0,
                          padding: "12px 12px 8px 12px",
                          borderRadius: 18,
                          background: "#f7faff",
                          boxShadow: "0 2px 16px #b2cdf933",
                          marginBottom: 10,
                          overflowX: "auto",
                          maxWidth: "100%", // chiếm hết chiều ngang khung chat
                          minHeight: 90,
                          transition: "background .2s",
                          scrollbarWidth: "thin",
                        }}
                      >
                        {/* Nút cộng để thêm ảnh mới */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 78,
                            height: 78,
                            borderRadius: 18,
                            background: "#eaf2fd",
                            cursor: uploading ? "not-allowed" : "pointer",
                            border: "2px dashed #b5c8e6",
                            marginRight: 10,
                            transition: "background .2s",
                            opacity: uploading ? 0.6 : 1,
                            flex: "0 0 auto",
                          }}
                          title="Thêm ảnh"
                        >
                          <PictureOutlined
                            style={{ fontSize: 32, color: "#4686f5" }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                            disabled={uploading}
                          />
                        </label>
                        {/* Danh sách ảnh được chọn */}
                        <div
                          style={{
                            display: "flex",
                            gap: 14,
                            flex: "1 1 auto",
                            overflowX: "auto",
                            minWidth: 0, // Cho phép scroll khi nhiều ảnh
                          }}
                        >
                          {selectedImages.map((img, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                width: 78,
                                height: 78,
                                borderRadius: 18,
                                overflow: "hidden",
                                background: "#fff",
                                boxShadow: "0 2px 10px #e3ebf7",
                                flex: "0 0 auto",
                              }}
                            >
                              <img
                                src={img.url}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 18,
                                  userSelect: "none",
                                  pointerEvents: "none",
                                }}
                              />
                              {/* Nút x custom */}
                              <div
                                onClick={
                                  uploading
                                    ? undefined
                                    : () => removePreviewImage(idx)
                                }
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#fff",
                                  border: "2px solid #4686f5",
                                  color: "#4686f5",
                                  fontWeight: "bold",
                                  fontSize: 19,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 8px #b3cfff33",
                                  zIndex: 10,
                                  transition: "filter 0.15s",
                                  filter: "drop-shadow(0 1px 4px #4686f555)",
                                  userSelect: "none",
                                  pointerEvents: uploading ? "none" : "auto",
                                  opacity: uploading ? 0.5 : 1,
                                  cursor: uploading ? "not-allowed" : "pointer",
                                }}
                                title="Xoá ảnh này"
                              >
                                ×
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFile && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#f7faff",
                          borderRadius: 14,
                          padding: "10px 16px",
                          boxShadow: "0 2px 8px #b2cdf922",
                          marginBottom: 8,
                          marginTop: 6,
                          maxWidth: 340,
                          gap: 8,
                        }}
                      >
                        <PaperClipOutlined
                          style={{ fontSize: 22, color: "#52c41a" }}
                        />
                        <span style={{ fontWeight: 500 }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ color: "#888", fontSize: 13 }}>
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <Button
                          size="small"
                          type="text"
                          style={{ color: "red", marginLeft: 4 }}
                          onClick={() => setSelectedFile(null)}
                          disabled={uploading}
                        >
                          ×
                        </Button>
                      </div>
                    )}

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {/* Action buttons with Ant Design */}
                      <div style={{ display: "flex", gap: 4 }}>
                        <Tooltip title="Send image">
                          <Button
                            shape="circle"
                            icon={<PictureOutlined style={{ fontSize: 18 }} />}
                            style={{
                              color: "#4686f5",
                              border: "none",
                              background: "none",
                              position: "relative",
                              cursor: uploading ? "not-allowed" : "pointer",
                            }}
                            tabIndex={-1}
                            loading={uploading}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                cursor: uploading ? "not-allowed" : "pointer",
                              }}
                              disabled={uploading}
                              onChange={handleImageChange}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Send file">
                          <Button
                            shape="circle"
                            icon={
                              <PaperClipOutlined style={{ fontSize: 18 }} />
                            }
                            style={{
                              color: "#52c41a",
                              border: "none",
                              background: "none",
                              position: "relative",
                            }}
                            tabIndex={-1}
                            disabled={uploading}
                          >
                            <input
                              type="file"
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                cursor: uploading ? "not-allowed" : "pointer",
                              }}
                              disabled={uploading}
                              onChange={handleFileChange}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Send emoji icon">
                          <Button
                            shape="circle"
                            icon={<SmileOutlined style={{ fontSize: 18 }} />}
                            style={{
                              color: "#eb2f96",
                              border: "none",
                              background: "none",
                            }}
                            tabIndex={-1}
                            onClick={() => setShowEmoji((v) => !v)}
                          />
                        </Tooltip>
                        {/* Popup emoji picker */}
                        {showEmoji && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 50,
                              right: 0,
                              zIndex: 9999,
                            }}
                          >
                            <Picker data={data} onEmojiSelect={addEmoji} />
                          </div>
                        )}
                      </div>
                      <Input
                        style={{
                          flex: 1,
                          borderRadius: 20,
                          fontSize: 15,
                          paddingRight: 12,
                        }}
                        placeholder="Enter your message"
                        value={text}
                        onChange={onTyping}
                        onBlur={onInputBlur}
                        onPressEnter={handleSend}
                      />
                      {uploadError && (
                        <div style={{ color: "red", margin: "6px 0 0 0" }}>
                          {uploadError}
                        </div>
                      )}
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        style={{
                          borderRadius: 20,
                          minWidth: 48,
                          height: 40,
                          fontWeight: 500,
                          fontSize: 16,
                          boxShadow: "0 2px 8px #1890ff22",
                        }}
                        onClick={handleSend}
                        loading={uploading}
                        disabled={uploading}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Content>
          </Layout>
        </Layout>
        {lightboxOpen && (
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={lightboxImages}
            index={lightboxIndex}
          />
        )}
      </Card>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
}

export default ChatBox;
