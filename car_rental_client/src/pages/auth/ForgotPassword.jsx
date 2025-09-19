import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";
import Helmet from "../../components/Helmet/Helmet";

import "../../styles/auth/forgot-password.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle forgot password logic here
    console.log("Reset password for email:", email);
    setIsSubmitted(true);
  };

  return (
    <Helmet title="Forgot Password">
      <section>
        <Container>
          <Row>
            <Col lg="6" md="8" sm="12" className="m-auto">
              <div className="forgot-password__container">
                <div className="forgot-password__form">
                  {!isSubmitted ? (
                    <>
                      <h2 className="section__title">Forgot Your Password?</h2>
                      <p className="forgot-password__subtitle">
                        Don't worry! Enter your email address and we'll send you
                        a link to reset your password.
                      </p>

                      <Form onSubmit={handleSubmit}>
                        <FormGroup>
                          <Input
                            type="email"
                            placeholder="Enter your registered email address"
                            id="email"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </FormGroup>

                        <Button type="submit" className="auth__btn w-100 mb-3">
                          Send Reset Link
                        </Button>
                      </Form>

                      <div className="auth__links text-center">
                        <p>
                          Remember your password?{" "}
                          <Link to="/login">Back to Login</Link>
                        </p>
                        <p>
                          Don't have an account?{" "}
                          <Link to="/register">Create one here</Link>
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="reset-email-sent text-center">
                      <div className="success-icon mb-3">
                        <i className="ri-mail-send-line"></i>
                      </div>
                      <h2 className="section__title">Email Sent!</h2>
                      <p className="success-message">
                        We've sent a password reset link to{" "}
                        <strong>{email}</strong>. Please check your email and
                        follow the instructions to reset your password.
                      </p>

                      <div className="email-instructions mt-4">
                        <h6>Didn't receive the email?</h6>
                        <ul className="email-tips">
                          <li>Check your spam or junk folder</li>
                          <li>
                            Make sure you entered the correct email address
                          </li>
                          <li>The email may take a few minutes to arrive</li>
                        </ul>
                      </div>

                      <div className="auth__links mt-4">
                        <Button
                          className="auth__btn-secondary mb-2"
                          onClick={() => setIsSubmitted(false)}
                        >
                          Try Different Email
                        </Button>
                        <p>
                          <Link to="/login">Back to Login</Link>
                        </p>
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
  );
};

export default ForgotPassword;
