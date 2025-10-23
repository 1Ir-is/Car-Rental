import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import dayjs from "dayjs";

const API = process.env.REACT_APP_CHAT_API || "http://localhost:5000/api";
const SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET || "http://localhost:5000";

let socket;

function ChatBox({ open, onClose, openWithOwner, currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  const headers = {
    "x-user-id": currentUser?.id,
    "x-user-name": currentUser?.name,
    "x-user-avatar": currentUser?.avatar,
  };

  const getOtherUser = (conv) =>
    conv?.participants?.find(
      (p) => String(p.userId) !== String(currentUser?.id)
    );

  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    if (currentUser?.id) socket.emit("user:online", currentUser.id);

    socket.on("message:receive", (msg) => {
      if (activeConv && String(msg.conversationId) === String(activeConv._id)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        fetchConversations();
      }
    });

    socket.on("typing", ({ conversationId, userId, typing }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: typing ? userId : null,
      }));
    });

    return () => socket.disconnect();
  }, [currentUser]); // ✅ not binding activeConv wrongly

  useEffect(() => {
    if (open) {
      fetchConversations();
      if (openWithOwner) createOrGetConversation(openWithOwner);
    }
  }, [open, openWithOwner]);

  useEffect(() => {
    if (!activeConv) return;
    socket.emit("join:conversation", String(activeConv._id));
    fetchConversationDetail(activeConv._id);

    return () => socket.emit("leave:conversation", String(activeConv._id));
  }, [activeConv]);

  function scrollToBottom() {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  async function fetchConversations() {
    try {
      const res = await axios.get(`${API}/conversations`, { headers });
      if (res.data.success) setConversations(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function createOrGetConversation(owner) {
    try {
      let found = conversations.find(
        (c) =>
          String(c.vehicleId) === String(owner.vehicleId) &&
          c.participants.some((p) => String(p.userId) === String(owner.id))
      );

      if (found) {
        setActiveConv(found);
        return;
      }

      const res = await axios.post(
        `${API}/conversations`,
        { owner, vehicleId: owner.vehicleId },
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
      }
    } catch (err) {
      console.error(err);
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
  }

  function onTyping(e) {
    setText(e.target.value);
    if (!activeConv) return;
    socket.emit("typing", {
      conversationId: activeConv._id,
      userId: currentUser.id,
      typing: !!e.target.value,
    });
  }

  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        {/* LEFT - Conversation List */}
        <div style={styles.left}>
          <div style={styles.headerLeft}>
            <h4>Chat</h4>
            <button onClick={onClose}>✕</button>
          </div>

          <div style={styles.search}>
            <input placeholder="Tìm theo tên..." style={{ width: "100%" }} />
          </div>

          <div style={styles.convList}>
            {conversations.map((conv) => {
              const other = getOtherUser(conv);
              return (
                <div
                  key={conv._id}
                  style={{
                    ...styles.convItem,
                    background:
                      activeConv && String(activeConv._id) === String(conv._id)
                        ? "#f0f0f0"
                        : "transparent",
                  }}
                  onClick={() => setActiveConv(conv)}
                >
                  <img
                    src={other?.avatar || "/avatar.png"}
                    alt=""
                    style={styles.avatar}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {other?.name || "Người dùng"}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {conv.lastMessage
                          ? dayjs(conv.lastMessage.createdAt).format("HH:mm")
                          : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                      {conv.lastMessage
                        ? conv.lastMessage.content.slice(0, 50)
                        : "Nhấn để mở cuộc trò chuyện"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - Chat Window */}
        <div style={styles.right}>
          {!activeConv ? (
            <div style={styles.welcome}>
              <h3>Chào mừng bạn đến với Chat</h3>
              <p>Chọn một cuộc trò chuyện hoặc nhấn “Chat với Owner”.</p>
            </div>
          ) : (
            <>
              {/* ✅ FIXED HEADER */}
              <div style={styles.chatHeader}>
                {(() => {
                  const other = getOtherUser(activeConv);
                  return (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <img
                        src={other?.avatar || "/avatar.png"}
                        style={styles.avatar}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {other?.name || "Người dùng"}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Chủ xe
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div style={styles.messages}>
                {messages.map((m) => {
                  const isMe = String(m.senderId) === String(currentUser.id);
                  return (
                    <div
                      key={m._id || m.createdAt}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: 10,
                          borderRadius: 8,
                          background: isMe ? "#d1f0ff" : "#f1f1f1",
                        }}
                      >
                        <div style={{ fontSize: 14 }}>{m.content}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#666",
                            textAlign: "right",
                            marginTop: 6,
                          }}
                        >
                          {dayjs(m.createdAt).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputRow}>
                <input
                  placeholder="Nhập nội dung tin nhắn"
                  value={text}
                  onChange={onTyping}
                  style={styles.input}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} style={styles.sendBtn}>
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", right: 20, bottom: 20, zIndex: 9999 },
  box: {
    width: 900,
    height: 600,
    display: "flex",
    boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  left: {
    width: 320,
    borderRight: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
  },
  headerLeft: {
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  search: { padding: 10 },
  convList: { overflowY: "auto", padding: 10, flex: 1 },
  convItem: {
    display: "flex",
    gap: 12,
    padding: 10,
    cursor: "pointer",
    borderRadius: 6,
    alignItems: "center",
  },
  avatar: { width: 42, height: 42, borderRadius: 22, objectFit: "cover" },
  right: { flex: 1, display: "flex", flexDirection: "column" },
  welcome: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
  },
  chatHeader: { padding: 12, borderBottom: "1px solid #eee" },
  messages: { padding: 12, flex: 1, overflowY: "auto", background: "#fcfcfd" },
  inputRow: {
    display: "flex",
    padding: 12,
    gap: 8,
    borderTop: "1px solid #eee",
  },
  input: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" },
  sendBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0066ff",
    color: "#fff",
  },
};

export default ChatBox;
