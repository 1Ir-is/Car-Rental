import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handled = sessionStorage.getItem("oauth2_handled");
    if (handled) return;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const username = params.get("username");

    console.log("OAuth2 Redirect params:", { token, username });

    if (token && username) {
      login(username, token);
      sessionStorage.setItem("oauth2_handled", "true");
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [location, login, navigate]);

  return <div>Đang đăng nhập bằng Google...</div>;
}
