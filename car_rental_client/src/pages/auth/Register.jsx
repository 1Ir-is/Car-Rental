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

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = userData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
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

    if (!validateForm()) {
      return;
    }

    try {
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      };

      const result = await register(registrationData);

      if (result.success) {
        toast.success(result.message || "Registration successful!");
        navigate("/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    }
  };
  return (
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
                      <Input
                        type="password"
                        placeholder="Create password"
                        id="password"
                        required
                        onChange={handleChange}
                        value={userData.password}
                        disabled={loading}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        id="confirmPassword"
                        required
                        onChange={handleChange}
                        value={userData.confirmPassword}
                        disabled={loading}
                      />
                    </FormGroup>

                    <div className="terms__conditions mb-4">
                      <Input
                        type="checkbox"
                        id="terms"
                        required
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

                    <Button
                      type="submit"
                      className="auth__btn w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
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

export default Register;
