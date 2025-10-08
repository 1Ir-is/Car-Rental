import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Input } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Helmet from "../../components/Helmet/Helmet";
import FullPageLoader from "../../components/UI/FullPageLoader";

import "../../styles/auth/register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      userData.name.trim() !== "" &&
      userData.email.trim() !== "" &&
      userData.password !== "" &&
      userData.confirmPassword !== "" &&
      arePasswordRequirementsMet() &&
      confirmPasswordError === "" &&
      userData.password === userData.confirmPassword &&
      termsAccepted
    );
  };

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));

    // Check password requirements when password changes
    if (id === "password") {
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
    }

    // Validate confirm password
    if (id === "confirmPassword") {
      if (value && userData.password && value !== userData.password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }

    // Also check confirm password when password changes
    if (id === "password" && userData.confirmPassword) {
      if (userData.confirmPassword && value !== userData.confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = userData;

    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      };
      const result = await register(registrationData);
      console.log(result); // Xem giá trị thực tế

      if (result.success && result.data && result.data.needVerify) {
        toast.success(
          result.data.message || result.message || "Registration successful!"
        );
        navigate("/verify-email-otp", { state: { email: userData.email } });
      } else {
        toast.error(
          result.data?.message || result.message || "Registration failed"
        );
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    }
  };
  return (
    <>
      <Helmet title="Register">
        <section>
          <Container>
            <Row>
              <Col lg="8" md="10" sm="12" className="m-auto">
                <div className="register__container">
                  <div className="register__form">
                    <h2 className="section__title">Create Your Account</h2>
                    <p className="register__subtitle">
                      Join us today and start your car rental journey!
                    </p>

                    <Form onSubmit={handleSubmit}>
                      <FormGroup>
                        <Input
                          type="text"
                          placeholder="Full Name"
                          id="name"
                          required
                          onChange={handleChange}
                          value={userData.name}
                          disabled={loading}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          id="email"
                          required
                          onChange={handleChange}
                          value={userData.email}
                          disabled={loading}
                        />
                      </FormGroup>

                      <FormGroup>
                        <div className="password-input-wrapper">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            id="password"
                            required
                            onChange={handleChange}
                            value={userData.password}
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
                                passwordRequirements.hasUpperCase ? "met" : ""
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
                                passwordRequirements.hasLowerCase ? "met" : ""
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
                                passwordRequirements.hasSpecialChar ? "met" : ""
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
                      </FormGroup>

                      <FormGroup>
                        <div className="password-input-wrapper">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            id="confirmPassword"
                            required
                            onChange={handleChange}
                            value={userData.confirmPassword}
                            disabled={loading}
                            className={confirmPasswordError ? "is-invalid" : ""}
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

                      <div className="terms__conditions mb-4">
                        <Input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          disabled={loading}
                        />
                        <label htmlFor="terms" className="ms-2">
                          I agree to the{" "}
                          <Link to="/terms" className="terms__link">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="terms__link">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="auth__btn w-100"
                        disabled={loading || !isFormValid()}
                      >
                        CREATE ACCOUNT
                      </button>
                    </Form>

                    <div className="auth__link">
                      <p>
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
                      </p>
                    </div>

                    <div className="social__login">
                      <p className="text-center mb-3">Or register with</p>
                      <div className="social__buttons d-flex gap-3 justify-content-center">
                        <button
                          className="social__btn google__btn"
                          disabled={loading}
                          type="button"
                        >
                          <i className="ri-google-fill"></i> Google
                        </button>
                        <button
                          className="social__btn facebook__btn"
                          disabled={loading}
                          type="button"
                        >
                          <i className="ri-facebook-fill"></i> Facebook
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>

      <FullPageLoader isLoading={loading} tip="Đang tạo tài khoản..." />
    </>
  );
};

export default Register;
