import React, { useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../UI/ScrollToTop";
import ScrollToTopButton from "../UI/ScrollToTopButton";
import Routers from "../../routers/Routers";
import { useAuth } from "../../context/AuthContext";
import FloatingChatBubble from "../Chat/FloatingChatBubble";

const Layout = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth(); // Thêm dòng này để lấy user
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
      {/* Ẩn FloatingChatBubble nếu chưa login */}
      {!!user && !!user.id && (
        <FloatingChatBubble
          open={chatOpen}
          onOpen={() => setChatOpen(true)}
          onClose={() => setChatOpen(false)}
        />
      )}
      <ScrollToTopButton />
    </div>
  );
};
export default Layout;
