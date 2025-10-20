import React from "react";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../UI/ScrollToTop";
import ScrollToTopButton from "../UI/ScrollToTopButton";
import Routers from "../../routers/Routers";
import ChatBox from "../UI/ChatBox";

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
      <ScrollToTopButton />
      {/* ChatBox fixed at bottom right */}
      <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}>
        <ChatBox />
      </div>
    </div>
  );
};

export default Layout;
