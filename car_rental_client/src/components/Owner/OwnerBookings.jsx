import React, { useState } from "react";
import BookingDetailModal from "./BookingDetailModal";

const mockBookings = [
  {
    id: 101,
    car: "Toyota Camry 2022",
    renter: "Nguyen Van A",
    startDate: "2025-10-28",
    endDate: "2025-10-30",
    status: "Pending",
    total: 120,
  },
  {
    id: 102,
    car: "Ford Ranger 4x4",
    renter: "Tran Thi B",
    startDate: "2025-10-25",
    endDate: "2025-10-27",
    status: "Confirmed",
    total: 180,
  },
  {
    id: 103,
    car: "Kia Morning 2021",
    renter: "Le Van C",
    startDate: "2025-10-20",
    endDate: "2025-10-22",
    status: "Completed",
    total: 90,
  },
];

const statusColors = {
  Pending: "#f59e42",
  Confirmed: "#2563eb",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

const OwnerBookings = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleDetails = (booking) => {
    setSelectedBooking({
      carName: booking.car,
      price: booking.total,
      customerName: booking.renter,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

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
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  color: "#1e293b",
                }}
              >
                #
              </th>
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
            {mockBookings.map((b, idx) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 8px", color: "#64748b" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "10px 8px" }}>{b.car}</td>
                <td style={{ padding: "10px 8px" }}>{b.renter}</td>
                <td style={{ padding: "10px 8px" }}>{b.startDate}</td>
                <td style={{ padding: "10px 8px" }}>{b.endDate}</td>
                <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                  ${b.total}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span
                    style={{
                      background: statusColors[b.status] || "#e5e7eb",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {b.status === "Pending" && (
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
                    >
                      Confirm
                    </button>
                  )}
                  {b.status === "Confirmed" && (
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
                    >
                      Cancel
                    </button>
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
        Showing {mockBookings.length} bookings.{" "}
        <span style={{ marginLeft: 16 }}>
          Total Revenue:{" "}
          <b>${mockBookings.reduce((sum, b) => sum + b.total, 0)}</b>
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
