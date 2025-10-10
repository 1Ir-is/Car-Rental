import React from "react";

const OwnerSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-line",
      description: "Overview & Statistics",
    },
    {
      id: "cars",
      label: "Manage Cars",
      icon: "ri-car-line",
      description: "View & Edit Cars",
    },
    {
      id: "add-car",
      label: "Add New Car",
      icon: "ri-add-circle-line",
      description: "Add Vehicle to Fleet",
    },
    {
      id: "bookings",
      label: "Rental Requests",
      icon: "ri-calendar-check-line",
      description: "Manage Bookings",
    },
    {
      id: "earnings",
      label: "Earnings & Reports",
      icon: "ri-money-dollar-circle-line",
      description: "Financial Overview",
    },
    {
      id: "reviews",
      label: "Customer Reviews",
      icon: "ri-star-line",
      description: "Feedback & Ratings",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "ri-settings-line",
      description: "Account & Preferences",
    },
  ];

  return (
    <div className="owner-sidebar">
      <div className="sidebar-header">
        <h5 className="sidebar-title">
          <i className="ri-settings-2-line me-2"></i>
          Owner Panel
        </h5>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className="sidebar-item-content">
              <div className="sidebar-item-main">
                <i className={`${item.icon} sidebar-icon`}></i>
                <div className="sidebar-item-text">
                  <span className="sidebar-label">{item.label}</span>
                  <small className="sidebar-description">
                    {item.description}
                  </small>
                </div>
              </div>
              <i className="ri-arrow-right-s-line sidebar-arrow"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="sidebar-stats">
        <h6 className="stats-title">Quick Stats</h6>
        <div className="stat-item">
          <div className="stat-icon bg-primary">
            <i className="ri-car-line"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">12</span>
            <span className="stat-label">Total Cars</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon bg-success">
            <i className="ri-calendar-check-line"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">8</span>
            <span className="stat-label">Active Rentals</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon bg-warning">
            <i className="ri-money-dollar-circle-line"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">$2,450</span>
            <span className="stat-label">This Month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSidebar;
