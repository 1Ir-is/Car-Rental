import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../UI/ScrollToTop";
import ScrollToTopButton from "../UI/ScrollToTopButton";
import Routers from "../../routers/Routers";
import { useAuth } from "../../context/AuthContext";
import FloatingChatBubble from "../Chat/FloatingChatBubble";

const Layout = () => {
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
      <FloatingChatBubble /> {/* ✅ Luôn xuất hiện các trang */}
      <ScrollToTopButton />
    </div>
  );
};
export default Layout;
