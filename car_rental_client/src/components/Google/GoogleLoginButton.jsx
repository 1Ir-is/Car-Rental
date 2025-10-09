import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google login failed!");
      return;
    }

    // Gọi loginWithGoogle ở AuthContext
    const result = await loginWithGoogle(idToken);

    if (result.success) {
      toast.success(result.message || "Login with Google successful!");
      navigate("/home");
    } else if (
      result.error === "ACCOUNT_DISABLED" ||
      result.message?.includes("ACCOUNT_DISABLED") ||
      result.message?.includes("bị khóa") ||
      result.message?.includes("tạm ngừng") ||
      result.message?.includes("disabled") ||
      result.message?.includes("suspended") ||
      result.message?.includes("Tài khoản đã bị vô hiệu hóa") ||
      result.message?.includes("Account has been disabled") ||
      // Thêm pattern check giống như login thường
      (result.message?.toLowerCase().includes("account") &&
        (result.message?.toLowerCase().includes("disabled") ||
          result.message?.toLowerCase().includes("suspended") ||
          result.message?.toLowerCase().includes("blocked") ||
          result.message?.toLowerCase().includes("locked") ||
          result.message?.toLowerCase().includes("banned")))
    ) {
      navigate("/account-suspended");
    } else {
      toast.error(result.message || "Google login failed");
    }
  };

  return (
    <GoogleLogin
      width="100%"
      onSuccess={handleSuccess}
      onError={() => {
        toast.error("Google login failed!");
      }}
      useOneTap
      disabled={loading}
    />
  );
};

export default GoogleLoginButton;
