import React from "react";
import { MessageCircle } from "lucide-react";
import ChatBox from "../UI/ChatBox";
import { useAuth } from "../../context/AuthContext";

const FloatingChatBubble = ({ open, onOpen, onClose }) => {
  const { user } = useAuth();

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
          }}
        >
          <MessageCircle size={32} color="#fff" />
        </button>
      )}
      {open && <ChatBox open={open} onClose={onClose} currentUser={user} />}
    </>
  );
};

export default FloatingChatBubble;
