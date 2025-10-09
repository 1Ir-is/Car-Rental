import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ smooth = true, delay = 0, excludePaths = [] }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip scroll for excluded paths
    if (excludePaths.includes(pathname)) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    };

    if (delay > 0) {
      const timer = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timer);
    } else {
      scrollToTop();
    }
  }, [pathname, smooth, delay, excludePaths]);

  return null;
};

export default ScrollToTop;
