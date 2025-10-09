import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to scroll to top when route changes
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const useScrollToTop = (smooth = true) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [pathname, smooth]);
};

export default useScrollToTop;
