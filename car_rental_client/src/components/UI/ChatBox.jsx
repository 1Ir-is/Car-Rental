import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { IoMdClose } from "react-icons/io";
import {
  FaCommentDots,
  FaMapMarkerAlt,
  FaSmile,
  FaPaperPlane,
} from "react-icons/fa";
import "../../styles/chatbox.css";

const conversations = [
  {
    id: 1,
    name: "Jack White",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Hi, I was wondering what time you...",
    time: "1d",
    messages: [
      { from: "owner", text: "Hi, how can I help?", time: "1d" },
      {
        from: "user",
        text: "Hi, I was wondering what time you're open till today?",
        time: "1d",
      },
    ],
  },
  {
    id: 2,
    name: "Abby Klein",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Hey Abby, I had a question.",
    time: "1d",
    messages: [
      { from: "owner", text: "Hey Abby, I had a question.", time: "1d" },
    ],
  },
];

export default function ChatBox() {
  const [selected, setSelected] = useState(conversations[0]);
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setSelected({
        ...selected,
        messages: [
          ...selected.messages,
          { from: "user", text: input, time: "now" },
        ],
      });
      setInput("");
    }
  };

  return (
    <>
      {/* Message bubble icon chỉ hiện khi đã đăng nhập */}
      {isAuthenticated && !open && (
        <div className="chatbox-bubble" onClick={() => setOpen(true)}>
          <FaCommentDots size={28} />
        </div>
      )}
      {/* Chatbox */}
      {open && (
        <div className="chatbox-container">
          <div className="chatbox-sidebar">
            <div className="chatbox-sidebar-header">
              <FaCommentDots
                style={{ color: "#2196f3", fontSize: 22, marginRight: 6 }}
              />
              <span>Chat</span>
            </div>
            <div className="chatbox-search-wrapper">
              <input
                className="chatbox-search"
                type="text"
                placeholder="Search..."
              />
            </div>
            <ul className="chatbox-conversation-list">
              {conversations.map((conv, idx) => (
                <li
                  key={conv.id}
                  className={`chatbox-conversation-item ${
                    selected.id === conv.id ? "active" : ""
                  }`}
                  onClick={() => setSelected(conv)}
                >
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="chatbox-avatar"
                  />
                  <div className="chatbox-conversation-info">
                    <span className="chatbox-conversation-name">
                      {conv.name}
                    </span>
                    <span className="chatbox-conversation-last">
                      {conv.lastMessage}
                    </span>
                  </div>
                  <span className="chatbox-conversation-time">{conv.time}</span>
                  {/* Chấm xanh active cho user đầu tiên */}
                  <span
                    className={`chatbox-active-dot${
                      idx === 0 ? "" : " chatbox-inactive-dot"
                    }`}
                  ></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="chatbox-main">
            <div className="chatbox-header">
              <img
                src={selected.avatar}
                alt={selected.name}
                className="chatbox-avatar-large"
              />
              <span className="chatbox-header-name">{selected.name}</span>
              <button
                className="chatbox-close-btn"
                onClick={() => setOpen(false)}
              >
                <IoMdClose size={24} />
              </button>
            </div>
            <div className="chatbox-messages">
              {selected.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chatbox-message ${
                    msg.from === "user"
                      ? "chatbox-message-user"
                      : "chatbox-message-owner"
                  }`}
                >
                  <span className="chatbox-message-text">{msg.text}</span>
                  <span className="chatbox-message-time">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="chatbox-input-area">
              <div className="chatbox-input-wrapper">
                <input
                  type="text"
                  className="chatbox-input"
                  placeholder="Say something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <div className="chatbox-input-icons">
                  <button
                    className="chatbox-input-icon"
                    title="Send location"
                    type="button"
                  >
                    <FaMapMarkerAlt size={18} />
                  </button>
                  <button
                    className="chatbox-input-icon"
                    title="Attach file"
                    type="button"
                  >
                    <FaPaperPlane
                      size={18}
                      style={{ transform: "rotate(-45deg)" }}
                    />
                  </button>
                  <button
                    className="chatbox-input-icon"
                    title="Send emoji"
                    type="button"
                  >
                    <FaSmile size={18} />
                  </button>
                </div>
              </div>
              <button
                className="chatbox-send-btn"
                onClick={handleSend}
                title="Send"
              >
                <FaPaperPlane size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
