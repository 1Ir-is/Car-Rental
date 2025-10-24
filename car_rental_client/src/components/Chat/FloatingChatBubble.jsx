import React, { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatBox from "../UI/ChatBox";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET || "http://localhost:5000";
const API = process.env.REACT_APP_CHAT_API || "http://localhost:5000/api";

const FloatingChatBubble = ({ open, onOpen, onClose }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [bubbleRinging, setBubbleRinging] = useState(false);
  const [conversationIds, setConversationIds] = useState([]);
  const socketRef = useRef(null);

  // Fetch all conversationIds user is in
  useEffect(() => {
    if (!user || !user.id) return;
    axios
      .get(`${API}/conversations`, {
        headers: { "x-user-id": user.id },
      })
      .then((res) => {
        if (res.data?.data) {
          setConversationIds(res.data.data.map((c) => String(c._id)));
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });
      socketRef.current.emit("user:online", user.id);
    }
    // Join all conversations
    conversationIds.forEach((id) => {
      socketRef.current.emit("join:conversation", String(id));
    });

    const socket = socketRef.current;
    const onMsg = (msg) => {
      if (msg.senderId !== user.id && !open) {
        setUnreadCount((c) => c + 1);
        setBubbleRinging(true);
        setTimeout(() => setBubbleRinging(false), 600);
      }
    };
    socket.on("message:receive", onMsg);

    return () => {
      socket.off("message:receive", onMsg);
      // socket.disconnect(); // chỉ disconnect nếu muốn đóng hoàn toàn socket này
    };
  }, [user, open, conversationIds]);

  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          onClick={onOpen}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#ff4500",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            zIndex: "10000",
            outline: "none",
          }}
        >
          <MessageCircle size={32} color="#fff" />
          {unreadCount > 0 && (
            <span
              className={bubbleRinging ? "bubble-shake" : ""}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                minWidth: 22,
                height: 22,
                borderRadius: "50%",
                background: "red",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px #d3e3f5cc",
                zIndex: 2,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      )}
      {open && <ChatBox open={open} onClose={onClose} currentUser={user} />}
    </>
  );
};

export default FloatingChatBubble;
