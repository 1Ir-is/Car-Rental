import React, { useState, useEffect } from "react";
import "../../styles/scroll-to-top-button.css";

const getScrollY = () =>
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0;

const ScrollToTopButton = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = getScrollY();
      console.log("ScrollY:", y);
      setShow(y > 200);
    };
    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`scroll-to-top-btn${show ? " show" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <i className="ri-arrow-up-line"></i>
    </button>
  );
};

export default ScrollToTopButton;
