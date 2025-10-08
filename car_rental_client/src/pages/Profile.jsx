import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Spinner,
} from "reactstrap";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import "../styles/avatar-upload.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    avatar: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        avatar: user.avatar || "",
      };
      setFormData(userData);
      setAvatarPreview(user.avatar || "");

      // Set selected date for DatePicker
      if (user.dateOfBirth) {
        try {
          // Parse date ensuring correct timezone handling
          const dateStr = user.dateOfBirth.includes("T")
            ? user.dateOfBirth.split("T")[0]
            : user.dateOfBirth;
          setSelectedDate(dayjs(dateStr));
        } catch (error) {
          setSelectedDate(null);
        }
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData((prevData) => ({
      ...prevData,
      dateOfBirth: date ? date.format("YYYY-MM-DD") : "",
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Vui lòng chọn file ảnh (JPG, PNG, GIF)");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setAvatarPreview(base64String);
        setFormData((prevData) => ({
          ...prevData,
          avatar: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setFormData((prevData) => ({
      ...prevData,
      avatar: "",
    }));
    // Reset file input
    const fileInput = document.getElementById("avatarFile");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Function to get trust point status info
  const getTrustPointInfo = (trustPoint) => {
    const point = trustPoint || 0;

    if (point >= 80) {
      return {
        color: "success",
        icon: "ri-star-fill",
        level: "Xuất sắc",
        description: "Người dùng có độ tin cậy rất cao",
      };
    } else if (point >= 60) {
      return {
        color: "primary",
        icon: "ri-star-line",
        level: "Tốt",
        description: "Người dùng có độ tin cậy tốt",
      };
    } else if (point >= 40) {
      return {
        color: "warning",
        icon: "ri-star-half-line",
        level: "Trung bình",
        description: "Người dùng có độ tin cậy trung bình",
      };
    } else {
      return {
        color: "secondary",
        icon: "ri-star-s-line",
        level: "Mới",
        description: "Người dùng mới hoặc chưa có nhiều hoạt động",
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        toast.error("Name and email are required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      console.log("Submitting profile update:", formData);
      const result = await updateUser(formData);

      if (result.success) {
        toast.success("Profile updated successfully!");
        console.log("Profile updated:", result.data);
      } else {
        toast.error(result.message || "Failed to update profile");
        console.error("Profile update failed:", result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating profile");
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <Helmet title="Profile">
        <CommonSection title="Profile" />
        <section>
          <Container>
            <Row>
              <Col lg="12" className="text-center">
                <Spinner color="primary" />
                <p className="mt-3">Loading profile...</p>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>
    );
  }

  return (
    <Helmet title="My Profile">
      <CommonSection title="My Profile" />
      <section>
        <Container>
          <Row>
            <Col lg="8" md="10" className="m-auto">
              <Card>
                <CardBody>
                  {/* Avatar Section */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block mb-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                        style={{
                          width: "120px",
                          height: "120px",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                          border: "4px solid #f8f9fa",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      >
                        {avatarPreview || formData.avatar ? (
                          <img
                            src={avatarPreview || formData.avatar}
                            alt="Profile Avatar"
                            className="rounded-circle"
                            style={{
                              width: "112px",
                              height: "112px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(formData.name)
                        )}
                      </div>

                      {/* Upload Button Overlay */}
                      <div
                        className="position-absolute"
                        style={{
                          bottom: "5px",
                          right: "5px",
                          cursor: "pointer",
                        }}
                      >
                        <label
                          htmlFor="avatarFile"
                          className="btn btn-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: "35px",
                            height: "35px",
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          <i
                            className="ri-camera-line"
                            style={{ fontSize: "14px" }}
                          ></i>
                        </label>
                        <input
                          type="file"
                          id="avatarFile"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={handleAvatarChange}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>

                    <h4>{formData.name || "Your Name"}</h4>
                    <p className="text-muted">{formData.email}</p>

                    {/* Trust Point Display */}
                    <div className="mt-2 mb-3">
                      {(() => {
                        const trustPoint =
                          user?.trustPoint || user?.trust_point || 0;
                        const trustInfo = getTrustPointInfo(trustPoint);
                        return (
                          <div className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill">
                            <i
                              className={`${trustInfo.icon} text-${trustInfo.color} me-2`}
                            ></i>
                            <span
                              className={`fw-bold text-${trustInfo.color} me-1`}
                            >
                              {trustPoint}
                            </span>
                            <span className="text-muted small me-2">điểm</span>
                            <span
                              className={`badge bg-${trustInfo.color} ms-1`}
                            >
                              {trustInfo.level}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Avatar Actions */}
                    <div className="mt-2">
                      <label
                        htmlFor="avatarFile"
                        className="btn btn-outline-primary btn-sm me-2"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="ri-upload-line me-1"></i>
                        Chọn ảnh
                      </label>
                      {(avatarPreview || formData.avatar) && (
                        <Button
                          color="outline-danger"
                          size="sm"
                          onClick={handleRemoveAvatar}
                        >
                          <i className="ri-delete-bin-line me-1"></i>
                          Xóa ảnh
                        </Button>
                      )}
                    </div>
                    <small className="text-muted d-block mt-2">
                      Chấp nhận: JPG, PNG, GIF. Kích thước tối đa: 5MB
                    </small>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    {/* Trust Point Info Section */}
                    <div className="bg-light p-3 rounded mb-4">
                      <h6 className="mb-3">
                        <i className="ri-star-line text-warning me-2"></i>
                        Thông tin độ tin cậy
                      </h6>
                      <Row>
                        <Col md="8">
                          {(() => {
                            const trustPoint =
                              user?.trustPoint || user?.trust_point || 0;
                            const trustInfo = getTrustPointInfo(trustPoint);
                            return (
                              <div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span>Điểm tin cậy hiện tại:</span>
                                  <span
                                    className={`badge bg-${trustInfo.color} fs-6 px-3 py-2`}
                                  >
                                    <i className={`${trustInfo.icon} me-1`}></i>
                                    {trustPoint} điểm - {trustInfo.level}
                                  </span>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "8px" }}
                                >
                                  <div
                                    className={`progress-bar bg-${trustInfo.color}`}
                                    style={{
                                      width: `${Math.min(trustPoint, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <small className="text-muted mt-1 d-block">
                                  {trustInfo.description}
                                </small>
                              </div>
                            );
                          })()}
                        </Col>
                        <Col md="4">
                          <small className="text-muted">
                            <i className="ri-information-line me-1"></i>
                            <strong>Cách tăng điểm:</strong>
                            <br />
                            • Hoàn thành chuyến đi đúng hạn
                            <br />
                            • Nhận đánh giá tích cực
                            <br />• Xác minh thông tin cá nhân
                          </small>
                        </Col>
                      </Row>
                    </div>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="name">Full Name</Label>
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
                          <Label for="email">Email Address</Label>
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
                          <Label for="phone">Phone Number</Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="dateOfBirth">Date of Birth</Label>
                          <div className="position-relative">
                            <DatePicker
                              id="dateOfBirth"
                              value={selectedDate}
                              onChange={handleDateChange}
                              format="DD/MM/YYYY"
                              maxDate={dayjs()}
                              placeholder="Select your date of birth"
                              style={{
                                width: "100%",
                                height: "38px",
                                borderRadius: "4px",
                                borderColor: "#ced4da",
                              }}
                              allowClear
                              changeOnBlur
                              showToday={false}
                              picker="date"
                              size="large"
                              suffixIcon={
                                <i
                                  className="ri-calendar-line"
                                  style={{ color: "#6c757d" }}
                                ></i>
                              }
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label for="address">Address</Label>
                      <Input
                        type="textarea"
                        id="address"
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                      />
                    </FormGroup>

                    <div className="text-center">
                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Profile;
