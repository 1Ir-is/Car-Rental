import React from "react";
import { FaCommentDots } from "react-icons/fa";
import { useChatBox } from "../../context/ChatBoxContext";

const MessageBubble = () => {
  const { openChatBox } = useChatBox();

  return (
    <div
      onClick={() => openChatBox(null)}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 999,
        background: "linear-gradient(90deg,#2196f3 0%,#0066ff 100%)",
        color: "#fff",
        borderRadius: "50%",
        width: 56,
        height: 56,
        boxShadow: "0 2px 8px rgba(0,102,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 28,
      }}
      title="Mở trò chuyện"
    >
      <FaCommentDots />
    </div>
  );
};

export default MessageBubble;
