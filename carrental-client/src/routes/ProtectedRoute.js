import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute component để bảo vệ các route cần đăng nhập.
 * Nếu user đã đăng nhập sẽ render Outlet (hoặc children),
 * nếu chưa sẽ chuyển hướng về trang /login.
 */
export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { user } = useAuth();

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!user || !user.token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu đã đăng nhập, render children hoặc Outlet (dùng cho nested route)
  return children ? children : <Outlet />;
}