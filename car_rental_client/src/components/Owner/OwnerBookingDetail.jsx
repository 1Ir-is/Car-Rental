import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";

// Mock data for demo
const mockBookings = [
  {
    id: 101,
    car: "Toyota Camry 2022",
    renter: "Nguyen Van A",
    startDate: "2025-10-28",
    endDate: "2025-10-30",
    status: "Pending",
    total: 120,
    pickupLocation: "Da Nang Center",
    dropoffLocation: "Airport",
    note: "Need child seat",
  },
  {
    id: 102,
    car: "Ford Ranger 4x4",
    renter: "Tran Thi B",
    startDate: "2025-10-25",
    endDate: "2025-10-27",
    status: "Confirmed",
    total: 180,
    pickupLocation: "Hotel Novotel",
    dropoffLocation: "Train Station",
    note: "",
  },
  {
    id: 103,
    car: "Kia Morning 2021",
    renter: "Le Van C",
    startDate: "2025-10-20",
    endDate: "2025-10-22",
    status: "Completed",
    total: 90,
    pickupLocation: "Han Market",
    dropoffLocation: "Han Market",
    note: "No special request",
  },
];

const statusColors = {
  Pending: "#f59e42",
  Confirmed: "#2563eb",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

const OwnerBookingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const booking = mockBookings.find((b) => b.id === Number(id));

  if (!booking) {
    return (
      <Container className="my-5">
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(30,42,73,.08)",
            padding: 32,
          }}
        >
          <CardBody>
            <h3 style={{ color: "#ef4444" }}>Booking not found</h3>
            <Button
              color="primary"
              onClick={() => navigate(-1)}
              style={{ marginTop: 16 }}
            >
              Back
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(30,42,73,.08)",
          padding: 32,
        }}
      >
        <CardBody>
          <Row className="mb-4">
            <Col>
              <h2 style={{ fontWeight: 700, color: "#1e293b" }}>
                Booking Details
              </h2>
              <p style={{ color: "#64748b" }}>
                Full information for booking #{booking.id}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <div style={{ marginBottom: 18 }}>
                <b>Car:</b> {booking.car}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Renter:</b> {booking.renter}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Status:</b>{" "}
                <span
                  style={{
                    background: statusColors[booking.status],
                    color: "#fff",
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontWeight: 600,
                  }}
                >
                  {booking.status}
                </span>
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Total:</b> ${booking.total}
              </div>
            </Col>
            <Col md="6">
              <div style={{ marginBottom: 18 }}>
                <b>Start Date:</b> {booking.startDate}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>End Date:</b> {booking.endDate}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Pickup Location:</b> {booking.pickupLocation}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Dropoff Location:</b> {booking.dropoffLocation}
              </div>
              <div style={{ marginBottom: 18 }}>
                <b>Note:</b> {booking.note || "None"}
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 32 }}>
            <Button
              color="primary"
              onClick={() => navigate(-1)}
              style={{ marginRight: 12 }}
            >
              Back
            </Button>
            {booking.status === "Pending" && (
              <Button color="success" style={{ marginRight: 12 }}>
                Confirm
              </Button>
            )}
            {booking.status === "Confirmed" && (
              <Button color="danger">Cancel</Button>
            )}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default OwnerBookingDetail;
