import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authUtils } from "../services/authService";

const RedirectIfAuthenticated = ({ children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      navigate("/home"); // hoặc "/home"
    }
  }, []);
  return children;
};

export default RedirectIfAuthenticated;
