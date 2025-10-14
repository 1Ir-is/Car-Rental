import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useAuth } from "../../context/AuthContext";
import Helmet from "../../components/Helmet/Helmet";
import OwnerSidebar from "../../components/Owner/OwnerSidebar";
import OwnerStats from "../../components/Owner/OwnerStats";
import OwnerCarManagement from "../../components/Owner/OwnerCarManagement";
import AddNewCar from "../../components/Owner/AddNewCar";
import EditCar from "../../components/Owner/EditCar";
import OwnerBookings from "../../components/Owner/OwnerBookings";
import OwnerEarnings from "../../components/Owner/OwnerEarnings";
import OwnerReviews from "../../components/Owner/OwnerReviews";
import OwnerSettings from "../../components/Owner/OwnerSettings";
import "../../styles/owner-dashboard.css";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [editingCar, setEditingCar] = useState(null);

  // Helper function to check if user is owner
  const isOwner = (user) => {
    if (!user || !user.role) return false;
    return user.role.id && user.role.id.toString() === "3";
  };

  // Redirect if not owner
  if (!user || !isOwner(user)) {
    return (
      <div className="unauthorized-access">
        <Container>
          <Row className="justify-content-center">
            <Col lg="6" className="text-center">
              <h2>Access Denied</h2>
              <p>You need owner privileges to access this page.</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <OwnerStats />;
      case "cars":
        return (
          <OwnerCarManagement
            setActiveSection={setActiveSection}
            setEditingCar={setEditingCar}
          />
        );
      case "add-car":
        return <AddNewCar setActiveSection={setActiveSection} />;
      case "edit-car":
        return (
          <EditCar setActiveSection={setActiveSection} carData={editingCar} />
        );
      case "bookings":
        return <OwnerBookings />;
      case "earnings":
        return <OwnerEarnings />;
      case "reviews":
        return <OwnerReviews />;
      case "settings":
        return <OwnerSettings />;
      default:
        return <OwnerStats />;
    }
  };

  return (
    <Helmet title="Owner Dashboard">
      <div className="owner-dashboard">
        {/* Dashboard Content */}
        <Container
          fluid
          className="dashboard-content"
          style={{ paddingTop: "2rem" }}
        >
          <Row className="h-100">
            {/* Sidebar */}
            <Col lg="3" md="4" className="dashboard-sidebar">
              <OwnerSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            </Col>

            {/* Main Content */}
            <Col lg="9" md="8" className="dashboard-main">
              <div className="content-wrapper">{renderContent()}</div>
            </Col>
          </Row>
        </Container>
      </div>
    </Helmet>
  );
};

export default OwnerDashboard;
