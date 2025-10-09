import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import "../styles/account-suspended.css";

const AccountSuspended = () => (
  <Helmet title="Account Suspended">
    <section className="account-suspended-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg="8" md="10" sm="12">
            <div className="account-suspended__container">
              {/* Icon */}
              <div className="suspended-icon">
                <i className="ri-shield-cross-line"></i>
              </div>

              {/* Title */}
              <h1 className="suspended-title">Account Suspended</h1>

              {/* Subtitle */}
              <p className="suspended-subtitle">
                We regret to inform you that your account has been temporarily
                suspended
              </p>

              {/* Description */}
              <div className="suspended-description">
                <p>
                  Your account has been temporarily locked due to violations of
                  our terms of service or security policies.
                </p>
              </div>

              {/* Contact Information */}
              <div className="contact-info">
                <h5>
                  <i className="ri-customer-service-2-line me-2"></i>
                  Customer Support Contact
                </h5>
                <div className="contact-item">
                  <i className="ri-mail-line"></i>
                  <span>support@carrental.com</span>
                </div>
                <div className="contact-item">
                  <i className="ri-phone-line"></i>
                  <span>1900 1234 (8:00 AM - 10:00 PM, all days)</span>
                </div>
                <div className="contact-item">
                  <i className="ri-time-line"></i>
                  <span>Processing time: 1-3 business days</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <Link to="/login" className="btn-back-login">
                  <i className="ri-arrow-left-line"></i>
                  Back to Login
                </Link>
                <a
                  href="mailto:support@carrental.com"
                  className="btn-contact-admin"
                >
                  <i className="ri-mail-send-line"></i>
                  Send Support Email
                </a>
              </div>

              {/* Help Tips */}
              <div className="help-tips">
                <h6>
                  <i className="ri-lightbulb-line me-2"></i>
                  To unlock your account, please provide:
                </h6>
                <ul>
                  <li>Personal information for identity verification</li>
                  <li>Reason why you believe the suspension is a mistake</li>
                  <li>Supporting evidence or related documents (if any)</li>
                  <li>Commitment to comply with terms of service</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  </Helmet>
);

export default AccountSuspended;
