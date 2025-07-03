import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./context/AuthContext";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import useAutoLogout from "./hooks/useAutoLogout";
import ProtectedRoute from "./routes/ProtectedRoute";

function AutoLogoutWrapper({ children }) {
  useAutoLogout();
  return children;
}

function App() {
  return (
    <AuthProvider>
      <AutoLogoutWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/oauth2/redirect"
              element={<OAuth2RedirectHandler />}
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AutoLogoutWrapper>
    </AuthProvider>
  );
}

export default App;
