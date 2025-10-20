import React, { useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../UI/ScrollToTop";
import ScrollToTopButton from "../UI/ScrollToTopButton";
import Routers from "../../routers/Routers";
import ChatBox from "../UI/ChatBox";
import { FaCommentDots } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const supportUser = {
  id: "support",
  name: "Support Team",
  email: "support@yourdomain.com",
  avatar: "https://i.imgur.com/yourSupportAvatar.png",
};

const Layout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <ScrollToTop />
      <Header />
      <main style={{ flex: "1" }}>
        <Routers />
      </main>
      <Footer />
      <ScrollToTopButton />

      {/* Bubble luôn xuất hiện ở mọi trang */}
      {!isChatOpen && (
        <div
          onClick={handleOpenChat}
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
      )}

      {/* ChatBox fixed khi mở */}
      {isChatOpen && currentUser && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 400,
            maxWidth: "90vw",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}
        >
          {/* Đóng chatbox */}
          <div style={{ textAlign: "right", padding: 8 }}>
            <button
              onClick={handleCloseChat}
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
          <ChatBox
            user={{
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              avatar: currentUser.avatar,
            }}
            owner={supportUser}
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
