import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useChatBox } from "../../context/ChatBoxContext";
import MessageBubble from "./MessageBubble";

const SOCKET_SERVER_URL = "http://localhost:3001";

export default function ChatBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [content, setContent] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef();
  const {
    open: chatBoxOpen,
    closeChatBox,
    currentOwner,
    setCurrentOwner,
  } = useChatBox();

  // Nếu là owner, khi mở chatbox, lấy danh sách user đã từng chat với owner
  useEffect(() => {
    if (user && user.role?.name === "OWNER" && chatBoxOpen && !currentOwner) {
      axios
        .get(`${SOCKET_SERVER_URL}/api/chat-users?ownerId=${user.id}`)
        .then((res) => setUserList(res.data.users));
    }
  }, [user, chatBoxOpen, currentOwner]);

  // Khi có user & currentOwner, load hội thoại
  useEffect(() => {
    if (!user || !currentOwner) return;
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("join", { userId: user.id });
    socketRef.current.on("online_users", setOnlineUsers);
    socketRef.current.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    axios
      .get(
        `${SOCKET_SERVER_URL}/api/messages?userId=${user.id}&ownerId=${currentOwner.id}`
      )
      .then((res) => setMessages(res.data.messages));
    return () => {
      socketRef.current.disconnect();
    };
  }, [user, currentOwner]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const msg = {
      senderId: user.id,
      receiverId: currentOwner.id,
      senderName: user.name,
      receiverName: currentOwner.name,
      senderAvatar: user.avatar,
      receiverAvatar: currentOwner.avatar,
      senderRole: user.role?.name?.toLowerCase() || "user",
      receiverRole: currentOwner.role?.name?.toLowerCase() || "owner",
      content,
    };

    socketRef.current.emit("chat_message", msg);
    setContent("");
  };

  return (
    <>
      {user && !chatBoxOpen && <MessageBubble />}
      {chatBoxOpen && (
        <div
          style={{
            width: 400,
            height: 500,
            border: "1px solid #ddd",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            position: "fixed",
            bottom: 40,
            right: 40,
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "right", padding: 8 }}>
            <button
              onClick={closeChatBox}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: "#2196f3",
              }}
              title="Đóng chat"
            >
              ×
            </button>
          </div>
          {/* Nếu là owner và chưa chọn user nào, hiển thị danh sách user đã chat */}
          {user.role?.name === "OWNER" && !currentOwner ? (
            <div style={{ padding: 16, textAlign: "center" }}>
              <div>Chọn một user để xem tin nhắn:</div>
              {userList.length === 0 && (
                <div style={{ marginTop: 16, color: "#999" }}>
                  Chưa có user nào nhắn cho bạn.
                </div>
              )}
              {userList.map((u) => (
                <div
                  key={u.id}
                  style={{
                    cursor: "pointer",
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => setCurrentOwner(u)}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      marginRight: 6,
                    }}
                  />
                  <span style={{ fontWeight: "bold" }}>{u.name}</span>
                </div>
              ))}
            </div>
          ) : currentOwner ? (
            <>
              <div
                style={{
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  fontWeight: "bold",
                }}
              >
                Chat với {currentOwner.name}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 8,
                      textAlign: msg.senderId === user.id ? "right" : "left",
                    }}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        verticalAlign: "middle",
                      }}
                    />
                    <span style={{ fontWeight: "bold", margin: "0 4px" }}>
                      {msg.senderName}
                    </span>
                    <span>{msg.content}</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSend}
                style={{
                  display: "flex",
                  padding: 8,
                  borderTop: "1px solid #eee",
                }}
              >
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: 8,
                    borderRadius: 4,
                  }}
                />
                <button
                  type="submit"
                  style={{ marginLeft: 8, padding: "0 16px" }}
                >
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: 16, textAlign: "center" }}>
              <div>Chọn một owner để bắt đầu trò chuyện</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
