import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { applicationService } from "../services/applicationService";
import { useNavigate } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import "../styles/become-driver.css";

const BecomeDriver = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingApplication, setExistingApplication] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    identity: "",
    title: "",
    description: "",
    type: "PERSONAL", // Default to PERSONAL
  });

  // Check if user is authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to apply as a driver");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Check for existing application
  React.useEffect(() => {
    const checkExistingApplication = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setCheckingStatus(true);
        const result = await applicationService.getDriverApplicationStatus();

        if (result.success && result.data) {
          setExistingApplication(result.data);
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExistingApplication();
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.email ||
        !formData.address ||
        !formData.identity ||
        !formData.title
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Phone validation (Vietnamese phone format)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        toast.error("Please enter a valid phone number");
        return;
      }

      // TODO: Call API to submit application
      console.log("Submitting driver application:", formData);

      // Call API to submit driver application
      const result = await applicationService.submitDriverApplication(formData);

      if (result.success) {
        toast.success(
          result.message ||
            "Your driver application has been submitted successfully! We will review it within 3-5 business days."
        );
        navigate("/profile");
      } else {
        toast.error(
          result.message || "Failed to submit application. Please try again."
        );
      }
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error("Driver application error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || checkingStatus) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner color="primary" />
        <span className="ms-2">
          {!isAuthenticated
            ? "Redirecting to login..."
            : "Checking application status..."}
        </span>
      </div>
    );
  }

  return (
    <Helmet title="Become a Driver">
      <CommonSection title="Become a Driver" />

      <section className="become-driver-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg="8" md="10">
              {/* Application Status Card - Show if user has existing application */}
              {existingApplication && (
                <Card className="application-status-card mb-4">
                  <CardBody>
                    <div className="status-header d-flex align-items-center mb-3">
                      <div className="status-icon me-3">
                        <i
                          className={`ri-file-text-line ${
                            existingApplication.status === "APPROVED"
                              ? "text-success"
                              : existingApplication.status === "REJECTED"
                              ? "text-danger"
                              : existingApplication.status === "PENDING"
                              ? "text-warning"
                              : "text-info"
                          }`}
                        ></i>
                      </div>
                      <div>
                        <h4 className="mb-1">Your Driver Application</h4>
                        <p className="mb-0 text-muted">
                          Application submitted on{" "}
                          {new Date(
                            existingApplication.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="status-details">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Status:</strong>
                          <span
                            className={`ms-2 badge ${
                              existingApplication.status === "APPROVED"
                                ? "bg-success"
                                : existingApplication.status === "REJECTED"
                                ? "bg-danger"
                                : existingApplication.status === "PENDING"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                          >
                            {existingApplication.status === "PENDING"
                              ? "Đang được xét duyệt"
                              : existingApplication.status === "APPROVED"
                              ? "Đã được phê duyệt"
                              : existingApplication.status === "REJECTED"
                              ? "Bị từ chối"
                              : "Chưa gửi"}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <strong>Application Type:</strong>
                          <span className="ms-2">
                            {existingApplication.type === "PERSONAL"
                              ? "Tài xế cá nhân"
                              : "Tài xế doanh nghiệp"}
                          </span>
                        </div>
                      </div>

                      {existingApplication.title && (
                        <div className="mb-2">
                          <strong>Title:</strong> {existingApplication.title}
                        </div>
                      )}

                      {existingApplication.status === "PENDING" && (
                        <Alert color="info" className="mt-3">
                          <i className="ri-time-line me-2"></i>
                          Đơn đăng ký của bạn hiện đang được xét duyệt. Chúng
                          tôi sẽ thông báo kết quả trong vòng 3-5 ngày làm việc.
                        </Alert>
                      )}

                      {existingApplication.status === "APPROVED" && (
                        <Alert color="success" className="mt-3">
                          <i className="ri-check-line me-2"></i>
                          Chúc mừng! Đơn đăng ký của bạn đã được phê duyệt. Bạn
                          có thể bắt đầu cho thuê xe ngay bây giờ.
                        </Alert>
                      )}

                      {existingApplication.status === "REJECTED" && (
                        <Alert color="danger" className="mt-3">
                          <i className="ri-close-line me-2"></i>
                          Rất tiếc, đơn đăng ký của bạn không được phê duyệt.
                          Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
                        </Alert>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Introduction Card - Only show if no application or application was rejected */}
              {(!existingApplication ||
                existingApplication.status === "REJECTED") && (
                <Card className="become-driver-intro mb-4">
                  <CardBody className="text-center">
                    <div className="intro-icon mb-3">
                      <i className="ri-car-line"></i>
                    </div>
                    <h3 className="text-primary mb-3">
                      Join Our Driver Network
                    </h3>
                    <p className="lead text-muted mb-0">
                      Earn extra income by sharing your vehicle with our trusted
                      community. Complete the application below and start
                      earning today!
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Application Form - Only show if no application or rejected */}
              {(!existingApplication ||
                existingApplication.status === "REJECTED") && (
                <Card className="application-form-card">
                  <CardHeader className="bg-primary text-white">
                    <h4 className="mb-0">
                      <i className="ri-file-text-line me-2"></i>
                      {existingApplication?.status === "REJECTED"
                        ? "Nộp Đơn Mới"
                        : "Driver Application Form"}
                    </h4>
                    <small>
                      {existingApplication?.status === "REJECTED"
                        ? "Vui lòng điền lại thông tin để nộp đơn mới"
                        : "Fill out all required fields to complete your application"}
                    </small>
                  </CardHeader>

                  <CardBody>
                    <Form onSubmit={handleSubmit}>
                      {/* Personal Information Section */}
                      <div className="form-section">
                        <h5 className="section-title">
                          <i className="ri-user-line me-2"></i>
                          Personal Information
                        </h5>

                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="name">
                                Full Name <span className="required">*</span>
                              </Label>
                              <Input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                              />
                            </FormGroup>
                          </Col>

                          <Col md="6">
                            <FormGroup>
                              <Label for="email">
                                Email Address{" "}
                                <span className="required">*</span>
                              </Label>
                              <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="phone">
                                Phone Number <span className="required">*</span>
                              </Label>
                              <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                required
                              />
                            </FormGroup>
                          </Col>

                          <Col md="6">
                            <FormGroup>
                              <Label for="identity">
                                Identity Number (CCCD/CMND){" "}
                                <span className="required">*</span>
                              </Label>
                              <Input
                                type="text"
                                id="identity"
                                name="identity"
                                value={formData.identity}
                                onChange={handleInputChange}
                                placeholder="Enter your ID number"
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <FormGroup>
                          <Label for="address">
                            Address <span className="required">*</span>
                          </Label>
                          <Input
                            type="textarea"
                            id="address"
                            name="address"
                            rows="3"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your full address"
                            required
                          />
                        </FormGroup>
                      </div>

                      {/* Application Details Section */}
                      <div className="form-section">
                        <h5 className="section-title">
                          <i className="ri-settings-line me-2"></i>
                          Application Details
                        </h5>

                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="type">
                                Application Type{" "}
                                <span className="required">*</span>
                              </Label>
                              <Input
                                type="select"
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="PERSONAL">
                                  Personal Driver
                                </option>
                                <option value="BUSINESS">
                                  Business Driver
                                </option>
                              </Input>
                              <small className="form-text text-muted">
                                {formData.type === "PERSONAL"
                                  ? "Individual driver with personal vehicle"
                                  : "Business entity with multiple vehicles"}
                              </small>
                            </FormGroup>
                          </Col>

                          <Col md="6">
                            <FormGroup>
                              <Label for="title">
                                Application Title{" "}
                                <span className="required">*</span>
                              </Label>
                              <Input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Experienced Driver Looking to Join"
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <FormGroup>
                          <Label for="description">
                            Description / Additional Information
                          </Label>
                          <Input
                            type="textarea"
                            id="description"
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Tell us about your driving experience, vehicle details, or any additional information..."
                          />
                          <small className="form-text text-muted">
                            Include information about your driving experience,
                            vehicle type, availability, etc.
                          </small>
                        </FormGroup>
                      </div>

                      {/* Terms and Conditions */}
                      <Alert color="info" className="terms-alert">
                        <h6>
                          <i className="ri-information-line me-2"></i>Important
                          Information
                        </h6>
                        <ul className="mb-0">
                          <li>
                            Your application will be reviewed within 3-5
                            business days
                          </li>
                          <li>
                            You must have a valid driver's license and insurance
                          </li>
                          <li>
                            Vehicle inspection may be required upon approval
                          </li>
                          <li>
                            All information provided must be accurate and
                            verifiable
                          </li>
                        </ul>
                      </Alert>

                      {/* Submit Button */}
                      <div className="text-center mt-4">
                        <Button
                          type="submit"
                          color="primary"
                          size="lg"
                          disabled={loading}
                          className="submit-btn"
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <i className="ri-send-plane-line me-2"></i>
                              Submit Application
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default BecomeDriver;
