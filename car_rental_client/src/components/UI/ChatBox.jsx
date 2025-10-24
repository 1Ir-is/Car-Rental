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

  function removePreviewImage(idx) {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    if ((!text.trim() && selectedImages.length === 0) || !activeConv) return;
    setUploading(true);

    let imageUrls = [];

    if (selectedImages.length > 0) {
      // DEBUG: Log tên file để chắc chắn không bị trùng
      console.log(
        "selectedImages:",
        selectedImages.map((i) => i.file && i.file.name)
      );

      // Tạo mảng promise upload song song, mỗi promise upload 1 file riêng biệt
      const uploadPromises = selectedImages.map((img) => {
        const form = new FormData();
        // Truyền đúng tên file
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

    const payload = {
      conversationId: activeConv._id,
      senderId: currentUser.id,
      content: text.trim(),
      images: imageUrls, // có thể là []
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
    setText("");
    setSelectedImages([]);
    setUploading(false);
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
    socket.on("conversation:update", () => {
      fetchConversations();
    });
    return () => socket.off("conversation:update");
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
                                ? // Hiển thị: "Tên user đã gửi X ảnh"
                                  `${
                                    String(conv.lastMessage.senderId) ===
                                    String(currentUser.id)
                                      ? "You"
                                      : (() => {
                                          // Get the other user's name (if any)
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
                                : // Nếu chỉ có 1 ảnh cũ
                                conv.lastMessage.image
                                ? `${
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
                                : // Nếu là tin nhắn text thường
                                conv.lastMessage.content
                                ? conv.lastMessage.content
                                : "Click to open the conversation"
                              : "Click to open the conversation"}
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
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                              marginBottom: 12,
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
                                  padding: "10px 18px 10px 18px",
                                  maxWidth: 320,
                                  boxShadow: isMe
                                    ? "0 1px 6px #91d5ff33"
                                    : "0 1px 6px #eee",
                                  textAlign: isMe ? "right" : "left",
                                  position: "relative",
                                  fontSize: 15,
                                  wordBreak: "break-word",
                                }}
                              >
                                {/* CHỖ NÀY: thay thế nội dung tin nhắn */}

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
                                      {/* Render only the first 4 images */}
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
                                      {/* Show overlay if more than 4 images */}
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
                                    }}
                                  />
                                )}
                                {m.content}
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
                      String(currentUser.id) && (
                      <div
                        style={{
                          position: "sticky",
                          bottom: 56,
                          left: 0,
                          width: "100%",
                          background: "rgba(255,255,255,0.95)",
                          fontStyle: "italic",
                          color: "#999",
                          padding: "4px 12px 2px 12px",
                          fontSize: 13,
                          zIndex: 2,
                        }}
                      >
                        {(() => {
                          let typingName =
                            getOtherUser(activeConv)?.name || "Other user";
                          try {
                            typingName = decodeURIComponent(typingName);
                          } catch {}
                          return typingName + " is typing...";
                        })()}
                      </div>
                    )}
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{
                      padding: 16,
                      background: "#fff",
                      borderTop: "1px solid #eee",
                    }}
                  >
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
                            }}
                            tabIndex={-1}
                            disabled={uploading}
                          >
                            <input type="file" style={{ display: "none" }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Send location">
                          <Button
                            shape="circle"
                            icon={
                              <EnvironmentOutlined style={{ fontSize: 18 }} />
                            }
                            style={{
                              color: "#faad14",
                              border: "none",
                              background: "none",
                            }}
                            tabIndex={-1}
                          />
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
    </div>
  );
}

export default ChatBox;
