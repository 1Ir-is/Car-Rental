import React from "react";
import "./BookingDetailModal.css";

const statusColors = {
  Pending: "#f59e42",
  Confirmed: "#2563eb",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

const BookingDetailModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-content modern">
        <button className="booking-modal-close" onClick={onClose} title="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="booking-modal-header">
          <div className="booking-modal-icon">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 13v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.5" cy="17.5" r="2.5" fill="#2563eb" />
              <circle cx="16.5" cy="17.5" r="2.5" fill="#2563eb" />
            </svg>
          </div>
          <div>
            <h2 className="booking-modal-title">Booking Details</h2>
            <div
              className="booking-modal-status"
              style={{ background: statusColors[booking.status] || "#e5e7eb" }}
            >
              {booking.status}
            </div>
          </div>
        </div>
        <div className="booking-modal-body">
          <div className="booking-modal-row">
            <div className="booking-modal-label">Car</div>
            <div className="booking-modal-value">{booking.carName}</div>
          </div>
          <div className="booking-modal-row">
            <div className="booking-modal-label">Customer</div>
            <div className="booking-modal-value">{booking.customerName}</div>
          </div>
          <div className="booking-modal-row">
            <div className="booking-modal-label">Price</div>
            <div className="booking-modal-value price">
              ${booking.price}/day
            </div>
          </div>
          <div className="booking-modal-row">
            <div className="booking-modal-label">Start Date</div>
            <div className="booking-modal-value">{booking.startDate}</div>
          </div>
          <div className="booking-modal-row">
            <div className="booking-modal-label">End Date</div>
            <div className="booking-modal-value">{booking.endDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
