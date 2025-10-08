import React, { useState, useEffect } from "react";
import bcrypt from "bcryptjs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, FormGroup, Input } from "reactstrap";
import Helmet from "../../components/Helmet/Helmet";
import { toast } from "react-toastify";
import { authAPI } from "../../services/authService";
import FullPageLoader from "../../components/UI/FullPageLoader";

import "../../styles/auth/register.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [oldPasswordHash, setOldPasswordHash] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [dots, setDots] = useState("");

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Animate dots for redirecting message
  useEffect(() => {
    let interval;
    if (isSuccess) {
      interval = setInterval(() => {
        setDots((prev) => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuccess]);

  // Fetch old password hash once when token is available
  useEffect(() => {
    async function fetchOldPasswordHash() {
      if (!token) return;
      try {
        const res = await authAPI.getOldPasswordHash(token);
        if (res.success && res.oldPasswordHash) {
          setOldPasswordHash(res.oldPasswordHash);
        }
      } catch (err) {
        // ignore
      }
    }
    fetchOldPasswordHash();
  }, [token]);

  // Function to check password requirements
  const checkPasswordRequirements = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };
  };

  // Function to check if all password requirements are met
  const arePasswordRequirementsMet = () => {
    return (
      passwordRequirements.minLength &&
      passwordRequirements.hasUpperCase &&
      passwordRequirements.hasLowerCase &&
      passwordRequirements.hasNumber &&
      passwordRequirements.hasSpecialChar
    );
  };

  // Function to check if form is ready to submit
  const isFormValid = () => {
    return (
      password !== "" &&
      confirmPassword !== "" &&
      arePasswordRequirementsMet() &&
      confirmPasswordError === "" &&
      password === confirmPassword &&
      !oldPasswordError
    );
  };

  // Validate password requirements & check with old password hash
  const handlePasswordChange = async (e) => {
    const value = e.target.value;
    setPassword(value);

    // Check password requirements
    if (value) {
      const requirements = checkPasswordRequirements(value);
      setPasswordRequirements(requirements);
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }

    // Check password trùng cũ
    if (oldPasswordHash && value) {
      // bcrypt.compare returns a promise!
      const isSame = await bcrypt.compare(value, oldPasswordHash);
      if (isSame) {
        setOldPasswordError(
          "Bạn đã nhập mật khẩu trước đó của bạn. Hãy thử mật khẩu khác!"
        );
      } else {
        setOldPasswordError("");
      }
    } else {
      setOldPasswordError("");
    }

    // Validate confirm password if it exists
    if (confirmPassword) {
      if (confirmPassword && value !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Validate confirm password
    if (value && password && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (!passwordRequirements.minLength) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!passwordRequirements.hasUpperCase) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }

    if (!passwordRequirements.hasLowerCase) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }

    if (!passwordRequirements.hasNumber) {
      toast.error("Password must contain at least one number");
      return false;
    }

    if (!passwordRequirements.hasSpecialChar) {
      toast.error("Password must contain at least one special character");
      return false;
    }

    if (oldPasswordError) {
      toast.error(oldPasswordError);
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      toast.error("Invalid or expired reset link!");
      return;
    }

    setLoading(true);
    const result = await authAPI.resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message || "Password reset successful!");
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } else {
      if (
        result.message === "Bạn đã nhập mật khẩu trước đó của bạn" ||
        result.message?.includes("mật khẩu trước đó")
      ) {
        toast.error(
          "Bạn đã nhập mật khẩu trước đó của bạn. Hãy thử mật khẩu khác!"
        );
      } else {
        toast.error(result.message || "Password reset failed!");
      }
    }
  };

  return (
    <>
      <Helmet title="Reset Password">
        <section>
          <Container>
            <Row>
              <Col lg="8" md="10" sm="12" className="m-auto">
                <div className="register__container">
                  <div className="register__form">
                    {!isSuccess ? (
                      <>
                        <h2 className="section__title">Reset Your Password</h2>
                        <p className="register__subtitle">
                          Create a new secure password for your account
                        </p>

                        <Form onSubmit={handleSubmit}>
                          <FormGroup>
                            <div className="password-input-wrapper">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="New password"
                                id="password"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                disabled={loading}
                                autoComplete="new-password"
                                style={{ paddingRight: "45px" }}
                                data-lpignore="true"
                                data-form-type="password"
                              />
                              <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                              >
                                <i
                                  className={`ri-eye${
                                    showPassword ? "-off" : ""
                                  }-line`}
                                ></i>
                              </button>
                            </div>
                            {/* Password Requirements - Always show */}
                            <div className="password-requirements">
                              <div className="requirements-title">
                                Password Requirements:
                              </div>
                              <div className="requirements-list">
                                <div
                                  className={`requirement-item ${
                                    passwordRequirements.minLength ? "met" : ""
                                  }`}
                                >
                                  <i
                                    className={`ri-${
                                      passwordRequirements.minLength
                                        ? "check"
                                        : "close"
                                    }-line`}
                                  ></i>
                                  At least 6 characters
                                </div>
                                <div
                                  className={`requirement-item ${
                                    passwordRequirements.hasUpperCase
                                      ? "met"
                                      : ""
                                  }`}
                                >
                                  <i
                                    className={`ri-${
                                      passwordRequirements.hasUpperCase
                                        ? "check"
                                        : "close"
                                    }-line`}
                                  ></i>
                                  At least one uppercase letter (A-Z)
                                </div>
                                <div
                                  className={`requirement-item ${
                                    passwordRequirements.hasLowerCase
                                      ? "met"
                                      : ""
                                  }`}
                                >
                                  <i
                                    className={`ri-${
                                      passwordRequirements.hasLowerCase
                                        ? "check"
                                        : "close"
                                    }-line`}
                                  ></i>
                                  At least one lowercase letter (a-z)
                                </div>
                                <div
                                  className={`requirement-item ${
                                    passwordRequirements.hasNumber ? "met" : ""
                                  }`}
                                >
                                  <i
                                    className={`ri-${
                                      passwordRequirements.hasNumber
                                        ? "check"
                                        : "close"
                                    }-line`}
                                  ></i>
                                  At least one number (0-9)
                                </div>
                                <div
                                  className={`requirement-item ${
                                    passwordRequirements.hasSpecialChar
                                      ? "met"
                                      : ""
                                  }`}
                                >
                                  <i
                                    className={`ri-${
                                      passwordRequirements.hasSpecialChar
                                        ? "check"
                                        : "close"
                                    }-line`}
                                  ></i>
                                  At least one special character (!@#$%...)
                                </div>
                              </div>
                            </div>
                            {/* Old password validation */}
                            {oldPasswordError && (
                              <div className="password-error">
                                {oldPasswordError}
                              </div>
                            )}
                          </FormGroup>

                          <FormGroup>
                            <div className="password-input-wrapper">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                id="confirmPassword"
                                required
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                disabled={loading}
                                className={
                                  confirmPasswordError ? "is-invalid" : ""
                                }
                                autoComplete="new-password"
                                style={{ paddingRight: "45px" }}
                                data-lpignore="true"
                                data-form-type="password"
                              />
                              <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                tabIndex={-1}
                              >
                                <i
                                  className={`ri-eye${
                                    showConfirmPassword ? "-off" : ""
                                  }-line`}
                                ></i>
                              </button>
                            </div>
                            {/* Confirm Password Validation */}
                            {confirmPasswordError && (
                              <div className="password-error">
                                {confirmPasswordError}
                              </div>
                            )}
                          </FormGroup>

                          <button
                            type="submit"
                            className="auth__btn w-100"
                            disabled={loading || !isFormValid()}
                          >
                            {loading ? "Resetting..." : "RESET PASSWORD"}
                          </button>
                        </Form>
                      </>
                    ) : (
                      <div className="reset-success text-center">
                        <div className="success-icon mb-3">
                          <i className="ri-check-double-line"></i>
                        </div>
                        <h2 className="section__title">
                          Password Reset Successfully!
                        </h2>
                        <p className="register__subtitle">
                          Your password has been reset successfully. <br />
                          You can now login with your new password.
                        </p>
                        <div className="redirect-info">
                          <i className="ri-information-line"></i>
                          <span>Redirecting to login page{dots}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>

      <FullPageLoader isLoading={loading} tip="Resetting password..." />
    </>
  );
};

export default ResetPassword;
