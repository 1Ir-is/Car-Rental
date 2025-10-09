import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import Helmet from "../../components/Helmet/Helmet";
import CommonSection from "../../components/UI/CommonSection";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockBookings = [
            {
              id: 1,
              carName: "Toyota Camry 2023",
              carImage: "/images/toyota-camry.jpg",
              bookingDate: "2025-09-15",
              startDate: "2025-09-20",
              endDate: "2025-09-25",
              totalDays: 5,
              pricePerDay: 70,
              totalAmount: 350,
              status: "confirmed",
              pickupLocation: "Da Nang Airport",
              dropoffLocation: "Da Nang Airport",
            },
            {
              id: 2,
              carName: "Honda Civic 2022",
              carImage: "/images/honda-civic.jpg",
              bookingDate: "2025-09-10",
              startDate: "2025-09-12",
              endDate: "2025-09-15",
              totalDays: 3,
              pricePerDay: 60,
              totalAmount: 180,
              status: "completed",
              pickupLocation: "Downtown Da Nang",
              dropoffLocation: "Downtown Da Nang",
            },
            {
              id: 3,
              carName: "BMW X3 2023",
              carImage: "/images/bmw-x3.jpg",
              bookingDate: "2025-09-18",
              startDate: "2025-10-01",
              endDate: "2025-10-07",
              totalDays: 6,
              pricePerDay: 120,
              totalAmount: 720,
              status: "pending",
              pickupLocation: "Da Nang Center",
              dropoffLocation: "Hoi An",
            },
          ];
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        toast.error("Failed to fetch bookings");
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        // Simulate API call
        toast.success("Booking cancelled successfully!");
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      } catch (error) {
        toast.error("Failed to cancel booking");
      }
    }
  };

  if (loading) {
    return (
      <Helmet title="My Bookings">
        <CommonSection title="My Bookings" />
        <section>
          <Container>
            <Row>
              <Col lg="12" className="text-center">
                <Spinner color="primary" />
                <p className="mt-3">Loading your bookings...</p>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>
    );
  }

  return (
    <Helmet title="My Bookings">
      <CommonSection title="My Bookings" />
      <section>
        <Container>
          {bookings.length === 0 ? (
            <Row>
              <Col lg="12" className="text-center">
                <div className="no-bookings py-5">
                  <i
                    className="ri-car-line"
                    style={{ fontSize: "4rem", color: "#ccc" }}
                  ></i>
                  <h3 className="mt-3">No Bookings Found</h3>
                  <p className="text-muted">
                    You haven't made any car reservations yet.
                  </p>
                  <Button color="primary" href="/cars">
                    Browse Cars
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              {bookings.map((booking) => (
                <Col lg="12" key={booking.id} className="mb-4">
                  <Card className="booking-card">
                    <CardBody>
                      <Row className="align-items-center">
                        <Col md="3">
                          <img
                            src={booking.carImage}
                            alt={booking.carName}
                            className="img-fluid rounded"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x200?text=Car+Image";
                            }}
                          />
                        </Col>
                        <Col md="6">
                          <h4>{booking.carName}</h4>
                          <div className="booking-details">
                            <p>
                              <strong>Booking Date:</strong>{" "}
                              {formatDate(booking.bookingDate)}
                            </p>
                            <p>
                              <strong>Rental Period:</strong>{" "}
                              {formatDate(booking.startDate)} -{" "}
                              {formatDate(booking.endDate)}
                            </p>
                            <p>
                              <strong>Duration:</strong> {booking.totalDays}{" "}
                              days
                            </p>
                            <p>
                              <strong>Pickup:</strong> {booking.pickupLocation}
                            </p>
                            <p>
                              <strong>Dropoff:</strong>{" "}
                              {booking.dropoffLocation}
                            </p>
                          </div>
                        </Col>
                        <Col md="3" className="text-end">
                          <Badge
                            color={getStatusColor(booking.status)}
                            pill
                            className="mb-2"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                          <div className="booking-price">
                            <p className="mb-1">
                              <small className="text-muted">
                                {formatCurrency(booking.pricePerDay)}/day
                              </small>
                            </p>
                            <h4 className="text-primary">
                              {formatCurrency(booking.totalAmount)}
                            </h4>
                          </div>
                          <div className="booking-actions mt-3">
                            {booking.status === "pending" && (
                              <Button
                                color="outline-danger"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                color="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                View Details
                              </Button>
                            )}
                            {booking.status === "completed" && (
                              <Button color="outline-secondary" size="sm">
                                Review
                              </Button>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Booking Statistics */}
          {bookings.length > 0 && (
            <Row className="mt-5">
              <Col lg="12">
                <Card className="booking-stats">
                  <CardBody>
                    <h4 className="mb-4">Booking Summary</h4>
                    <Row>
                      <Col md="3" className="text-center">
                        <h3 className="text-primary">{bookings.length}</h3>
                        <p>Total Bookings</p>
                      </Col>
                      <Col md="3" className="text-center">
                        <h3 className="text-success">
                          {
                            bookings.filter((b) => b.status === "completed")
                              .length
                          }
                        </h3>
                        <p>Completed</p>
                      </Col>
                      <Col md="3" className="text-center">
                        <h3 className="text-warning">
                          {
                            bookings.filter(
                              (b) =>
                                b.status === "confirmed" ||
                                b.status === "pending"
                            ).length
                          }
                        </h3>
                        <p>Upcoming</p>
                      </Col>
                      <Col md="3" className="text-center">
                        <h3 className="text-info">
                          {formatCurrency(
                            bookings.reduce(
                              (sum, booking) => sum + booking.totalAmount,
                              0
                            )
                          )}
                        </h3>
                        <p>Total Spent</p>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </Helmet>
  );
};

export default MyBookings;
