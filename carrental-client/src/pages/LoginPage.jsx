import React, { useEffect, useState } from "react";
import { login as loginApi } from "../api/auth";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    sessionStorage.removeItem("oauth2_handled");
  }, []);

  if (user && user.token) {
    return <Navigate to="/" replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginApi(form);
      login(form.username, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <h2>Login</h2>
        <input
          name="username"
          placeholder="Username"
          onChange={onChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={onChange}
          required
        />
        <button type="submit">Login</button>
        <div style={{ color: "red" }}>{error}</div>
      </form>

      <button
        onClick={() =>
          (window.location.href = "http://localhost:8080/api/auth/google")
        }
      >
        Đăng nhập với Google
      </button>
    </>
  );
}
