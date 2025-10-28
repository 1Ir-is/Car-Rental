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
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import MyBookingDetailModal from "./MyBookingDetailModal";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedBooking(null);
  };

  // FE pagination state
  const [page, setPage] = useState(1); // Trang hiện tại (bắt đầu từ 1)
  const pageSize = 5; // Số bookings mỗi trang

  // Lọc bỏ các booking bị cancel
  const filteredBookings = bookings.filter(
    (booking) => booking.status?.toUpperCase() !== "CANCELLED"
  );
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const pagedBookings = filteredBookings.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const res = await userService.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        toast.error(res.message || "Failed to fetch bookings");
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Tính số ngày thuê (duration)
  const getDuration = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))); // ít nhất 1 ngày
  };

  // SweetAlert2 Cancel
  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await userService.cancelBooking(bookingId);
          if (res.success) {
            Swal.fire(
              "Cancelled!",
              "Your booking has been cancelled.",
              "success"
            );
            setBookings((prev) =>
              prev.filter((booking) => booking.id !== bookingId)
            );
          } else {
            Swal.fire(
              "Error!",
              res.message || "Failed to cancel booking",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to cancel booking", "error");
        }
      }
    });
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
    <>
      <Helmet title="My Bookings">
        <CommonSection title="My Bookings" />
        <section>
          <Container>
            {pagedBookings.length === 0 ? (
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
                {pagedBookings.map((booking) => (
                  <Col lg="12" key={booking.id} className="mb-4">
                    <Card className="booking-card">
                      <CardBody>
                        <Row className="align-items-center">
                          <Col md="3">
                            <img
                              src={
                                booking.vehicleImages?.[0] ||
                                "https://via.placeholder.com/300x200?text=Car+Image"
                              }
                              alt={booking.vehicleName}
                              className="img-fluid rounded"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200?text=Car+Image";
                              }}
                            />
                          </Col>
                          <Col md="6">
                            <h4>{booking.vehicleName}</h4>
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
                                <strong>Duration:</strong>{" "}
                                {getDuration(
                                  booking.startDate,
                                  booking.endDate
                                )}{" "}
                                days
                              </p>
                              <p>
                                <strong>Pickup:</strong>{" "}
                                {booking.pickupLocation}
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
                              {booking.status
                                ? booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1).toLowerCase()
                                : ""}
                            </Badge>
                            <div className="booking-price">
                              <h4 className="text-primary">
                                {formatCurrency(booking.totalAmount)}
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#64748b",
                                    marginLeft: 8,
                                  }}
                                >
                                  (
                                  {formatCurrency(
                                    booking.vehicleDailyPrice ||
                                      booking.dailyPrice ||
                                      0
                                  )}
                                  /day)
                                </span>
                              </h4>
                            </div>
                            <div className="booking-actions mt-3">
                              {booking.status === "PENDING" && (
                                <Button
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  color="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleViewDetails(booking)}
                                >
                                  View Details
                                </Button>
                              )}
                              {booking.status === "COMPLETED" && (
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

            {/* Pagination controls */}
            {totalPages > 1 && (
              <Row>
                <Col className="text-center mt-4">
                  <Button
                    color="primary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{ marginRight: 8 }}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    color="primary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{ marginLeft: 8 }}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            )}

            {/* Booking Statistics */}
            {filteredBookings.length > 0 && (
              <Row className="mt-5">
                <Col lg="12">
                  <Card className="booking-stats">
                    <CardBody>
                      <h4 className="mb-4">Booking Summary</h4>
                      <Row>
                        <Col md="3" className="text-center">
                          <h3 className="text-primary">
                            {filteredBookings.length}
                          </h3>
                          <p>Total Bookings</p>
                        </Col>
                        <Col md="3" className="text-center">
                          <h3 className="text-success">
                            {
                              filteredBookings.filter(
                                (b) =>
                                  b.status &&
                                  b.status.toUpperCase() === "COMPLETED"
                              ).length
                            }
                          </h3>
                          <p>Completed</p>
                        </Col>
                        <Col md="3" className="text-center">
                          <h3 className="text-warning">
                            {
                              filteredBookings.filter(
                                (b) =>
                                  b.status &&
                                  (b.status.toUpperCase() === "CONFIRMED" ||
                                    b.status.toUpperCase() === "PENDING")
                              ).length
                            }
                          </h3>
                          <p>Upcoming</p>
                        </Col>
                        <Col md="3" className="text-center">
                          <h3 className="text-info">
                            {formatCurrency(
                              filteredBookings.reduce(
                                (sum, booking) =>
                                  sum + (booking.totalAmount || 0),
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

      <MyBookingDetailModal
        isOpen={detailModalOpen}
        onClose={handleCloseDetailModal}
        booking={selectedBooking}
      />
    </>
  );
};

export default MyBookings;
