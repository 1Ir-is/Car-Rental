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
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { authAPI } from "../services/authService";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    bookingReminders: true,
    language: "en",
    currency: "USD",
    theme: "light",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        ...JSON.parse(savedSettings),
      }));
    }
  }, []);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    toast.success("Settings updated!");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setLoadingChangePassword(true);
    const result = await authAPI.changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    setLoadingChangePassword(false);

    if (result.success) {
      toast.success(result.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(result.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    try {
      // Simulate API call to delete account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Account deleted successfully");
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const clearAllData = () => {
    localStorage.clear();
    toast.success("All local data cleared!");
    window.location.reload();
  };

  return (
    <Helmet title="Settings">
      <CommonSection title="Account Settings" />
      <section>
        <Container>
          <Row>
            <Col lg="8" md="10" className="m-auto">
              {/* Notification Settings */}
              <Card className="mb-4">
                <CardBody>
                  <h4 className="mb-4">
                    <i className="ri-notification-line me-2"></i>
                    Notification Preferences
                  </h4>

                  <FormGroup switch>
                    <Input
                      type="switch"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />
                    <Label check>Email Notifications</Label>
                    <small className="text-muted d-block">
                      Receive booking confirmations and updates via email
                    </small>
                  </FormGroup>

                  <FormGroup switch>
                    <Input
                      type="switch"
                      checked={settings.smsNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "smsNotifications",
                          e.target.checked
                        )
                      }
                    />
                    <Label check>SMS Notifications</Label>
                    <small className="text-muted d-block">
                      Receive booking reminders via SMS
                    </small>
                  </FormGroup>

                  <FormGroup switch>
                    <Input
                      type="switch"
                      checked={settings.marketingEmails}
                      onChange={(e) =>
                        handleSettingChange("marketingEmails", e.target.checked)
                      }
                    />
                    <Label check>Marketing Emails</Label>
                    <small className="text-muted d-block">
                      Receive promotional offers and newsletters
                    </small>
                  </FormGroup>

                  <FormGroup switch>
                    <Input
                      type="switch"
                      checked={settings.bookingReminders}
                      onChange={(e) =>
                        handleSettingChange(
                          "bookingReminders",
                          e.target.checked
                        )
                      }
                    />
                    <Label check>Booking Reminders</Label>
                    <small className="text-muted d-block">
                      Receive reminders before your rental period starts
                    </small>
                  </FormGroup>
                </CardBody>
              </Card>

              {/* Preferences */}
              <Card className="mb-4">
                <CardBody>
                  <h4 className="mb-4">
                    <i className="ri-settings-line me-2"></i>
                    Preferences
                  </h4>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="language">Language</Label>
                        <Input
                          type="select"
                          id="language"
                          value={settings.language}
                          onChange={(e) =>
                            handleSettingChange("language", e.target.value)
                          }
                        >
                          <option value="en">English</option>
                          <option value="vi">Tiếng Việt</option>
                          <option value="fr">Français</option>
                          <option value="es">Español</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="currency">Currency</Label>
                        <Input
                          type="select"
                          id="currency"
                          value={settings.currency}
                          onChange={(e) =>
                            handleSettingChange("currency", e.target.value)
                          }
                        >
                          <option value="USD">USD ($)</option>
                          <option value="VND">VND (₫)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label for="theme">Theme</Label>
                    <Input
                      type="select"
                      id="theme"
                      value={settings.theme}
                      onChange={(e) =>
                        handleSettingChange("theme", e.target.value)
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </Input>
                  </FormGroup>
                </CardBody>
              </Card>

              {/* Change Password */}
              <Card className="mb-4">
                <CardBody>
                  <h4 className="mb-4">
                    <i className="ri-lock-line me-2"></i>
                    Change Password
                  </h4>

                  <Form onSubmit={handlePasswordChange}>
                    <FormGroup>
                      <Label for="currentPassword">Current Password</Label>
                      <Input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="newPassword">New Password</Label>
                          <Input
                            type="password"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="confirmPassword">
                            Confirm New Password
                          </Label>
                          <Input
                            type="password"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Button
                      type="submit"
                      color="primary"
                      disabled={loadingChangePassword}
                    >
                      {loadingChangePassword
                        ? "Changing..."
                        : "Change Password"}
                    </Button>
                  </Form>
                </CardBody>
              </Card>

              {/* Data & Privacy */}
              <Card className="mb-4">
                <CardBody>
                  <h4 className="mb-4">
                    <i className="ri-shield-user-line me-2"></i>
                    Data & Privacy
                  </h4>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6>Download Your Data</h6>
                      <small className="text-muted">
                        Download a copy of your personal data and booking
                        history
                      </small>
                    </div>
                    <Button color="outline-primary" size="sm">
                      Download
                    </Button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6>Clear Local Data</h6>
                      <small className="text-muted">
                        Clear all locally stored preferences and cached data
                      </small>
                    </div>
                    <Button
                      color="outline-warning"
                      size="sm"
                      onClick={clearAllData}
                    >
                      Clear Data
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Danger Zone */}
              <Card className="border-danger">
                <CardBody>
                  <h4 className="mb-4 text-danger">
                    <i className="ri-error-warning-line me-2"></i>
                    Danger Zone
                  </h4>

                  <Alert color="warning">
                    <strong>Warning:</strong> These actions are irreversible.
                    Please be certain before proceeding.
                  </Alert>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Delete Account</h6>
                      <small className="text-muted">
                        Permanently delete your account and all associated data
                      </small>
                    </div>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(false)}>
        <ModalHeader toggle={() => setShowDeleteModal(false)}>
          Delete Account
        </ModalHeader>
        <ModalBody>
          <Alert color="danger">
            <strong>This action cannot be undone!</strong>
          </Alert>
          <p>
            This will permanently delete your account, all booking history, and
            personal data. You will not be able to recover this information.
          </p>
          <p>
            To confirm deletion, please type <strong>"DELETE"</strong> in the
            field below:
          </p>
          <Input
            type="text"
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "DELETE"}
          >
            Delete Account
          </Button>
        </ModalFooter>
      </Modal>
    </Helmet>
  );
};

export default Settings;
