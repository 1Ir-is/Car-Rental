import React from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const GoogleLoginButton = () => {
  const { loginWithGoogle, loading } = useAuth();

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
      window.location.href = "/home";
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
