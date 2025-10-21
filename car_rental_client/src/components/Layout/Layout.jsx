import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../UI/ScrollToTop";
import ScrollToTopButton from "../UI/ScrollToTopButton";
import Routers from "../../routers/Routers";
import { ChatBoxProvider } from "../../context/ChatBoxContext";
import ChatBox from "../UI/ChatBox";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const { user, isAuthenticated } = useAuth();
  return (
    <ChatBoxProvider>
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
        <ChatBox user={isAuthenticated ? user : null} />
      </div>
    </ChatBoxProvider>
  );
};
export default Layout;
