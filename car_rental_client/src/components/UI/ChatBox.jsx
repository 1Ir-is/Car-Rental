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

const { Sider, Content } = Layout;
const { Text } = Typography;

const API = process.env.REACT_APP_CHAT_API || "http://localhost:5000/api";
const SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET || "http://localhost:5000";
let socket;

function ChatBox({ open, onClose, openWithOwner, currentUser }) {
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
    if (currentUser?.role === "OWNER") {
      return conv?.participants?.find((p) => p.role !== "OWNER");
    }
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
          String(c.vehicleId) === String(ownerInfo.vehicleId) &&
          c.participants.some((p) => String(p.userId) === String(ownerInfo.id))
      );
      if (found) {
        setActiveConv(found);
        return;
      }
      const res = await axios.post(
        `${API}/conversations`,
        { owner: ownerInfo, vehicleId: ownerInfo.vehicleId },
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

  function handleSend() {
    if (!text.trim() || !activeConv) return;
    const payload = {
      conversationId: activeConv._id,
      senderId: currentUser.id,
      content: text.trim(),
    };
    socket.emit("message:send", payload);
    socket.emit("typing", {
      conversationId: activeConv._id,
      userId: currentUser.id,
      typing: false,
    });
    setMessages((prev) => [
      ...prev,
      {
        ...payload,
        createdAt: new Date().toISOString(),
        _id: `tmp-${Date.now()}`,
      },
    ]);
    setText("");
    scrollToBottom();

    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConv._id
          ? {
              ...c,
              lastMessage: {
                // Nếu bạn vẫn dùng lastMessage cũ, ép lại cho chắc chắn
                ...(c.lastMessage || {}),
                ...payload,
                readBy: [...(c.lastMessage?.readBy || []), currentUser.id],
              },
            }
          : c
      )
    );
    addReadConv(activeConv._id);
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
  const filteredConvs = conversations.filter((conv) => {
    const other = getOtherUser(conv);
    return (
      !search ||
      (other?.name || "").toLowerCase().includes(search.toLowerCase())
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
        bodyStyle={{ padding: 0, height: "100%" }}
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
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={onClose}
                />
              </Tooltip>
            </div>
            <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <Input.Search
                placeholder="Tìm theo tên..."
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
                        title={
                          <Text strong>{other?.name || "Người dùng"}</Text>
                        }
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
                              ? conv.lastMessage.content
                              : "Nhấn để mở cuộc trò chuyện"}
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
                    Chọn một cuộc trò chuyện hoặc nhấn “Chat với Owner”.
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
                      const roleLabel =
                        other?.role === "OWNER" || other?.role === "owner"
                          ? "Chủ xe"
                          : other?.role === "USER" || other?.role === "user"
                          ? "Người dùng"
                          : (other?.role?.name || "").toLowerCase() === "owner"
                          ? "Chủ xe"
                          : (other?.role?.name || "").toLowerCase() === "user"
                          ? "Người dùng"
                          : "Người dùng";
                      return (
                        <>
                          <Avatar
                            size={44}
                            icon={<UserOutlined />}
                            src={other?.avatar}
                          />
                          <div>
                            <Text strong style={{ fontSize: 17 }}>
                              {other?.name || "Người dùng"}
                            </Text>
                            <div style={{ fontSize: 12, color: "#888" }}>
                              {roleLabel}
                            </div>
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
                      dataSource={messages}
                      renderItem={(m) => {
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
                        {getOtherUser(activeConv)?.name || "Đối phương"} đang
                        nhập...
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
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {/* Action buttons with Ant Design */}
                      <div style={{ display: "flex", gap: 4 }}>
                        <Tooltip title="Gửi ảnh">
                          <Button
                            shape="circle"
                            icon={<PictureOutlined style={{ fontSize: 18 }} />}
                            style={{
                              color: "#1890ff",
                              border: "none",
                              background: "none",
                            }}
                            tabIndex={-1}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Gửi file">
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
                          >
                            <input type="file" style={{ display: "none" }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Gửi vị trí">
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
                        <Tooltip title="Gửi icon cảm xúc">
                          <Button
                            shape="circle"
                            icon={<SmileOutlined style={{ fontSize: 18 }} />}
                            style={{
                              color: "#eb2f96",
                              border: "none",
                              background: "none",
                            }}
                            tabIndex={-1}
                          />
                        </Tooltip>
                      </div>
                      <Input
                        style={{
                          flex: 1,
                          borderRadius: 20,
                          fontSize: 15,
                          paddingRight: 12,
                        }}
                        placeholder="Nhập nội dung tin nhắn"
                        value={text}
                        onChange={onTyping}
                        onBlur={onInputBlur}
                        onPressEnter={handleSend}
                      />
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
                      >
                        Gửi
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Content>
          </Layout>
        </Layout>
      </Card>
    </div>
  );
}

export default ChatBox;
