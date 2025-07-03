import React, { useState } from "react";
import { register as registerApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerApi(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Register failed");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Register</h2>
      <input
        name="username"
        placeholder="Username"
        onChange={onChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        type="email"
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
      <button type="submit">Register</button>
      <div style={{ color: "red" }}>{error}</div>
    </form>
  );
}
