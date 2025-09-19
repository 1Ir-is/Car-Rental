import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Helmet from "../../components/Helmet/Helmet";

import "../../styles/auth/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

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
      // Gọi login ở context, context sẽ tự fetch user info sau khi login thành công
      const result = await login({
        email: credentials.email,
        password: credentials.password,
        rememberMe: rememberMe,
      });

      if (result.success) {
        toast.success(result.message || "Login successful!");
        navigate("/home");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    }
  };

  return (
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
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        id="password"
                        required
                        onChange={handleChange}
                        value={credentials.password}
                        disabled={loading}
                      />
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
                      <Link to="/forgot-password" className="forgot__password">
                        Forgot Password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="auth__btn w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
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
                      <Button
                        className="social__btn google__btn"
                        disabled={loading}
                      >
                        <i className="ri-google-fill"></i> Google
                      </Button>
                      <Button
                        className="social__btn facebook__btn"
                        disabled={loading}
                      >
                        <i className="ri-facebook-fill"></i> Facebook
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Login;
