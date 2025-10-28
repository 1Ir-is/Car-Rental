import React from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

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

const MyBookingDetailModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const {
    vehicleName,
    vehicleImages,
    startDate,
    endDate,
    bookingDate,
    pickupLocation,
    dropoffLocation,
    totalAmount,
    vehicleDailyPrice,
    status,
    note,
  } = booking;

  // Modern status color
  const statusColor =
    status?.toLowerCase() === "pending"
      ? { bg: "#e0e7ff", color: "#2563eb", border: "1.5px solid #2563eb" }
      : status?.toLowerCase() === "confirmed"
      ? { bg: "#d1fae5", color: "#059669", border: "1.5px solid #059669" }
      : status?.toLowerCase() === "rejected"
      ? { bg: "#fee2e2", color: "#ef4444", border: "1.5px solid #ef4444" }
      : { bg: "#f3f4f6", color: "#64748b", border: "1.5px solid #e5e7eb" };

  return (
  <Modal isOpen={isOpen} toggle={onClose} centered size="lg" style={{ maxWidth: 700 }}>
      <ModalHeader
        toggle={onClose}
        style={{
          fontWeight: 700,
          fontSize: "1.22rem",
          color: "#2563eb",
          background: "#f8fafc",
          borderBottom: "1.5px solid #e5e7eb",
        }}
      >
        Your Booking Details
        {status && (
          <span
            style={{
              marginLeft: 18,
              background: statusColor.bg,
              color: statusColor.color,
              borderRadius: 14,
              padding: "7px 22px",
              fontWeight: 700,
              fontSize: 17,
              verticalAlign: "middle",
              border: statusColor.border,
              boxShadow: "0 2px 8px rgba(30,42,73,0.13)",
              letterSpacing: "0.5px",
              transition: "all 0.2s",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </span>
        )}
      </ModalHeader>
      <ModalBody
        style={{ background: "#f8fafc", padding: "38px 44px 38px 44px" }}
      >
        <div
          style={{
            display: "flex",
            gap: 44,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 200, textAlign: "center" }}>
            <img
              src={vehicleImages?.[0] || "/images/no-car.png"}
              alt={vehicleName}
              style={{
                width: 200,
                height: 130,
                objectFit: "cover",
                borderRadius: 18,
                border: "2.5px solid #e0e7ff",
                boxShadow: "0 8px 32px rgba(30,42,73,0.12)",
                marginBottom: 24,
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 260,
              fontSize: "1.13rem",
              color: "#1e293b",
              paddingTop: 8,
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: "#2563eb",
                  fontSize: "1.13rem",
                }}
              >
                Car:
              </span>{" "}
              {vehicleName}
            </div>
            <div style={{ marginBottom: 14 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: "#2563eb",
                  fontSize: "1.13rem",
                }}
              >
                Booking Date:
              </span>{" "}
              {formatDate(bookingDate)}
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700 }}>Rental Period:</span>{" "}
              {formatDate(startDate)} - {formatDate(endDate)}
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700 }}>Pickup:</span> {pickupLocation}
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700 }}>Dropoff:</span>{" "}
              {dropoffLocation}
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700 }}>Price/day:</span>{" "}
              <span style={{ color: "#2563eb" }}>
                {formatCurrency(vehicleDailyPrice)}
              </span>
            </div>
            <div style={{ marginBottom: 22 }}>
              <span style={{ fontWeight: 700 }}>Total:</span>{" "}
              <span
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "1.22rem",
                }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>
            {note && (
              <div
                style={{
                  background: "#e0e7ff",
                  borderRadius: 12,
                  padding: "14px 20px",
                  color: "#1e293b",
                  fontWeight: 500,
                  marginTop: 14,
                  fontSize: "1.12rem",
                  boxShadow: "0 2px 8px rgba(30,42,73,0.10)",
                }}
              >
                <span style={{ fontWeight: 700 }}>Note:</span> {note}
              </div>
            )}
          </div>
        </div>
        <div className="text-end mt-4">
          <Button
            color="secondary"
            onClick={onClose}
            style={{
              padding: "8px 32px",
              fontSize: "1.08rem",
              borderRadius: 8,
              fontWeight: 600,
              background: "#64748b",
              border: "none",
            }}
          >
            Close
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default MyBookingDetailModal;
