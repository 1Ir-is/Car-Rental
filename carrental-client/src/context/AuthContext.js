import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("jwt");
    return username && token ? { username, token } : null;
  });

  const login = (username, token) => {
    setUser({ username, token });
    localStorage.setItem("username", username);
    localStorage.setItem("jwt", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("jwt");
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
