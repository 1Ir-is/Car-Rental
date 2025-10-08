import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/authService";
import FullPageLoader from "../components/UI/FullPageLoader";

const VerifyEmailOtp = () => {
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(location.state?.email || "");
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (!otpString || !email || otpString.length !== 6) {
      toast.error("Please enter email and complete 6-digit OTP code!");
      return;
    }
    setLoading(true);
    // Gọi API từ service
    const result = await authAPI.verifyEmailOtp(email, otpString);
    setLoading(false);

    if (result.success) {
      toast.success(result.message || "Email verified!");
      navigate("/login");
    } else {
      toast.error(result.message || "Verification failed!");
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    const result = await authAPI.resendOtp(email);
    setResending(false);
    if (result.success) {
      toast.success(result.message || "Đã gửi lại mã xác thực!");
    } else {
      toast.error(result.message || "Không thể gửi lại mã xác thực!");
    }
  };

  return (
    <>
      <FullPageLoader isLoading={loading} tip="Đang xác thực mã OTP..." />
      <FullPageLoader isLoading={resending} tip="Đang gửi lại mã xác thực..." />

      <div
        style={{
          maxWidth: 420,
          margin: "60px auto",
          padding: 32,
          background: "#f3f4f6",
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          {/* Security Icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              borderRadius: "50%",
              marginBottom: 20,
              fontSize: 35,
            }}
          >
            🔒
          </div>
          <h2 style={{ color: "#2563eb", margin: "10px 0", fontSize: 24 }}>
            XÁC THỰC OTP
          </h2>
          <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
            Vui lòng nhập mã số chúng tôi đã gửi cho bạn qua email
            <br />
            <strong>****{email.slice(-15)}</strong>. Mã xác thực có giá trị
            trong <b>15 phút</b>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          {/* OTP Input Boxes */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 25,
            }}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                maxLength={1}
                style={{
                  width: 50,
                  height: 50,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  border: "2px solid #ddd",
                  borderRadius: 8,
                  outline: "none",
                  background: "#fff",
                  color: "#333",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ddd";
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || resending}
            style={{
              width: "100%",
              padding: "15px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: 25,
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: loading || resending ? "not-allowed" : "pointer",
              opacity: loading || resending ? 0.7 : 1,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading && !resending) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !resending) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "Đang xác thực..." : "Tiếp tục"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            color: "#888",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Chưa nhận được mã?{" "}
          <span
            style={{
              color: "#2563eb",
              cursor: resending ? "not-allowed" : "pointer",
              textDecoration: "underline",
              opacity: resending ? 0.6 : 1,
            }}
            onClick={resending ? undefined : handleResendOtp}
          >
            {resending ? "Đang gửi lại..." : "Gửi lại"}
          </span>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailOtp;
