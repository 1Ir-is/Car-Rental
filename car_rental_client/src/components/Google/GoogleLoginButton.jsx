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
      navigate("/home"); // <-- dùng navigate thay vì window.location.href
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
