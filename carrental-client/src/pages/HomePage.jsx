import React from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div>
        <h2>Welcome to Car Rental!</h2>
        <button onClick={handleLogin}>Đăng nhập</button>
        <button onClick={handleRegister}>Đăng ký</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}
