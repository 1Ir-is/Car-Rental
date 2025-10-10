import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const OwnerStats = () => {
  const statsCards = [
    {
      title: "Total Cars",
      value: "12",
      icon: "ri-car-line",
      color: "primary",
      change: "+2 this month",
      changeType: "positive",
    },
    {
      title: "Active Rentals",
      value: "8",
      icon: "ri-calendar-check-line",
      color: "success",
      change: "+3 this week",
      changeType: "positive",
    },
    {
      title: "Total Earnings",
      value: "$12,450",
      icon: "ri-money-dollar-circle-line",
      color: "warning",
      change: "+15% vs last month",
      changeType: "positive",
    },
    {
      title: "Customer Rating",
      value: "4.8",
      icon: "ri-star-fill",
      color: "info",
      change: "324 reviews",
      changeType: "neutral",
    },
  ];

  const recentBookings = [
    {
      id: 1,
      customer: "John Doe",
      car: "Toyota Camry",
      date: "2025-10-12",
      status: "confirmed",
      amount: "$180",
    },
    {
      id: 2,
      customer: "Jane Smith",
      car: "Honda Civic",
      date: "2025-10-15",
      status: "pending",
      amount: "$150",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      car: "BMW X5",
      date: "2025-10-18",
      status: "confirmed",
      amount: "$350",
    },
  ];

  return (
    <div className="owner-stats">
      <div className="section-header">
        <h4>Dashboard Overview</h4>
        <p className="text-muted">Monitor your rental business performance</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {statsCards.map((stat, index) => (
          <Col lg="3" md="6" sm="6" key={index} className="mb-3">
            <Card className="stats-card h-100">
              <CardBody className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-0 text-dark">{stat.value}</h3>
                    <small
                      className={`text-${
                        stat.changeType === "positive" ? "success" : "muted"
                      }`}
                    >
                      {stat.changeType === "positive" && (
                        <i className="ri-arrow-up-line me-1"></i>
                      )}
                      {stat.change}
                    </small>
                  </div>
                  <div className={`stats-icon bg-${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        {/* Recent Bookings */}
        <Col lg="8">
          <Card className="recent-bookings">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0">Recent Bookings</h5>
                <button className="btn btn-outline-primary btn-sm">
                  View All
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Car</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm me-2">
                              <span className="avatar-title bg-primary rounded-circle">
                                {booking.customer.charAt(0)}
                              </span>
                            </div>
                            {booking.customer}
                          </div>
                        </td>
                        <td>{booking.car}</td>
                        <td>{booking.date}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              booking.status === "confirmed"
                                ? "success"
                                : "warning"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="fw-bold">{booking.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg="4">
          <Card className="quick-actions">
            <CardBody>
              <h5 className="card-title mb-3">Quick Actions</h5>

              <div className="action-buttons">
                <button className="btn btn-primary w-100 mb-2">
                  <i className="ri-add-circle-line me-2"></i>
                  Add New Car
                </button>
                <button className="btn btn-outline-success w-100 mb-2">
                  <i className="ri-calendar-check-line me-2"></i>
                  View Bookings
                </button>
                <button className="btn btn-outline-info w-100 mb-2">
                  <i className="ri-bar-chart-line me-2"></i>
                  View Reports
                </button>
                <button className="btn btn-outline-warning w-100">
                  <i className="ri-settings-line me-2"></i>
                  Account Settings
                </button>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="revenue-chart mt-4">
                <h6>Monthly Revenue</h6>
                <div className="chart-placeholder bg-light rounded p-3 text-center">
                  <i
                    className="ri-bar-chart-line text-muted"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <p className="text-muted mb-0">Chart will be here</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OwnerStats;
