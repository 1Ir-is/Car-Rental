import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    return token && username ? { token, username } : null;
  });

  const login = (username, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setUser({ username, token });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    sessionStorage.removeItem("oauth2_handled");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
