import React, { useState, useEffect } from "react";
import BookingDetailModal from "./BookingDetailModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import vehicleService from "../../services/ownerService";

const statusColors = {
  PENDING: "#f59e42",
  CONFIRMED: "#2563eb",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getOwnerBookings();
        if (response.success && response.data) {
          setBookings(response.data);
        } else {
          toast.error(response.message || "Failed to fetch bookings");
        }
      } catch (error) {
        toast.error("Failed to fetch bookings");
      }
      setLoading(false);
    };
    fetchOwnerBookings();
  }, []);

  const handleConfirm = async (bookingId) => {
    Swal.fire({
      title: "Confirm booking?",
      text: "Do you want to confirm this rental request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, confirm!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await vehicleService.confirmBooking(bookingId);
          if (res.success) {
            toast.success("Booking confirmed!");
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: "CONFIRMED" } : b
              )
            );
          } else {
            toast.error(res.message || "Failed to confirm booking");
          }
        } catch (error) {
          toast.error("Failed to confirm booking");
        }
      }
    });
  };

  const handleCancel = async (bookingId) => {
    Swal.fire({
      title: "Cancel booking?",
      text: "Do you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await vehicleService.cancelBooking(bookingId);
          if (res.success) {
            toast.success("Booking cancelled!");
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: "CANCELLED" } : b
              )
            );
          } else {
            toast.error(res.message || "Failed to cancel booking");
          }
        } catch (error) {
          toast.error("Failed to cancel booking");
        }
      }
    });
  };

  // Hoàn tất booking (owner)
  const handleComplete = async (bookingId) => {
    Swal.fire({
      title: "Complete booking?",
      text: "Mark this booking as completed?",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, complete!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await vehicleService.completeBooking(bookingId);
          if (res.success) {
            toast.success("Booking completed!");
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: "COMPLETED" } : b
              )
            );
          } else {
            toast.error(res.message || "Failed to complete booking");
          }
        } catch (error) {
          toast.error("Failed to complete booking");
        }
      }
    });
  };

  const handleDetails = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter(
    (b) => b.status?.toUpperCase() !== "CANCELLED"
  );

  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  return (
    <div
      className="owner-bookings"
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(30,42,73,.08)",
        padding: 32,
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, color: "#1e293b" }}>
          Rental Requests & Bookings
        </h2>
        <p style={{ color: "#64748b" }}>
          Manage all booking requests and rental history here.
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Car</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Renter</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>
                Start Date
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>
                End Date
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>
                Total ($)
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b, idx) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 8px", color: "#64748b" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "10px 8px" }}>{b.vehicleName}</td>
                <td style={{ padding: "10px 8px" }}>{b.userName}</td>
                <td style={{ padding: "10px 8px" }}>{b.startDate}</td>
                <td style={{ padding: "10px 8px" }}>{b.endDate}</td>
                <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                  ${b.totalAmount}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span
                    style={{
                      background:
                        statusColors[b.status?.toUpperCase()] || "#e5e7eb",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {b.status?.charAt(0).toUpperCase() +
                      b.status?.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {b.status?.toUpperCase() === "PENDING" && (
                    <button
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 16px",
                        fontWeight: 600,
                        marginRight: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => handleConfirm(b.id)}
                    >
                      Confirm
                    </button>
                  )}
                  {b.status?.toUpperCase() === "CONFIRMED" && (
                    <>
                      <button
                        style={{
                          background: "#22c55e",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 16px",
                          fontWeight: 600,
                          marginRight: 8,
                          cursor: "pointer",
                        }}
                        onClick={() => handleComplete(b.id)}
                      >
                        Complete
                      </button>
                      <button
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 16px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    style={{
                      background: "#f3f4f6",
                      color: "#2563eb",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 16px",
                      fontWeight: 600,
                      marginLeft: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => handleDetails(b)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 32, color: "#64748b", fontSize: 15 }}>
        Showing {filteredBookings.length} bookings.{" "}
        <span style={{ marginLeft: 16 }}>
          Total Revenue: <b>${totalRevenue}</b>
        </span>
      </div>

      {/* Modal chi tiết booking */}
      <BookingDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
      />
    </div>
  );
};

export default OwnerBookings;
