import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Input } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import Helmet from "../../components/Helmet/Helmet";
import GoogleLoginButton from "../../components/Google/GoogleLoginButton";
import FullPageLoader from "../../components/UI/FullPageLoader";

import "../../styles/auth/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await login({
        email: credentials.email,
        password: credentials.password,
        rememberMe: rememberMe,
      });

      if (result.success) {
        toast.success(result.message || "Login successful!");
        navigate("/home");
        return;
      }

      // FIX: Điều hướng khi bị block
      if (result.error === "ACCOUNT_DISABLED") {
        navigate("/account-suspended");
        return;
      }

      if (
        result.error === "EMAIL_NOT_VERIFIED" ||
        result.message?.includes("Email chưa được xác thực")
      ) {
        Swal.fire({
          icon: "warning",
          title: "Email chưa được xác thực!",
          html: `
            <p>Vui lòng kiểm tra hộp thư của bạn để xác thực tài khoản.</p>
            <p>Nếu bạn chưa nhận được email, hãy kiểm tra cả mục Spam.</p>
            <button id="verifyOtpBtn" class="swal2-confirm swal2-styled" style="margin-top:10px;">Nhập mã xác thực</button>
          `,
          showConfirmButton: false,
          showCloseButton: true,
          didOpen: () => {
            document.getElementById("verifyOtpBtn").onclick = () => {
              localStorage.setItem("pendingVerifyEmail", credentials.email);
              navigate("/verify-email-otp");
              Swal.close();
            };
          },
        });
        return;
      }

      // Các trường hợp lỗi khác
      toast.error(result.message || "Login failed");
    } catch (error) {
      toast.error("An error occurred during login");
    }
  };
  return (
    <>
      <Helmet title="Login">
        <section>
          <Container>
            <Row>
              <Col lg="6" md="8" sm="12" className="m-auto">
                <div className="login__container">
                  <div className="login__form">
                    <h2 className="section__title">Login to Your Account</h2>
                    <p className="login__subtitle">
                      Welcome back! Please enter your credentials to continue.
                    </p>

                    <Form onSubmit={handleSubmit}>
                      <FormGroup>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          id="email"
                          required
                          onChange={handleChange}
                          value={credentials.email}
                          disabled={loading}
                        />
                      </FormGroup>

                      <FormGroup>
                        <div className="password-input-wrapper">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            id="password"
                            required
                            onChange={handleChange}
                            value={credentials.password}
                            disabled={loading}
                            autoComplete="current-password"
                            style={{ paddingRight: "45px" }}
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
                      </FormGroup>

                      <div className="login__options d-flex align-items-center justify-content-between mb-4">
                        <div className="remember__me">
                          <Input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                          />
                          <label htmlFor="remember" className="ms-2">
                            Remember me
                          </label>
                        </div>
                        <Link
                          to="/forgot-password"
                          className="forgot__password"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="auth__btn w-100"
                        disabled={loading}
                      >
                        LOGIN
                      </button>
                    </Form>

                    <div className="auth__link">
                      <p>
                        Don't have an account?{" "}
                        <Link to="/register">Create one here</Link>
                      </p>
                    </div>

                    <div className="social__login">
                      <p className="text-center mb-3">Or login with</p>
                      <div className="social__buttons d-flex gap-3 justify-content-center">
                        <GoogleLoginButton />
                        {/* Nếu muốn Facebook sau này thì để đây */}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>

      <FullPageLoader isLoading={loading} tip="Đang đăng nhập..." />
    </>
  );
};

export default Login;
