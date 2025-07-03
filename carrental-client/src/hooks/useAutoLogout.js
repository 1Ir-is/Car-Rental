import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const SESSION_TIMEOUT = 30 * 60 * 1000;

export default function useAutoLogout() {
  const { logout } = useAuth();
  const timeoutRef = useRef();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout();
        window.location.href = "/login";
        alert("Bạn đã bị đăng xuất do không hoạt động quá lâu!");
      }, SESSION_TIMEOUT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [logout]);
}
