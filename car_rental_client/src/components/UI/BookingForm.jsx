import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form, FormGroup, Button, Alert } from "reactstrap";
import { userService } from "../../services/userService";
import dayjs from "dayjs";
import "./booking-form.css";

const BookingForm = ({ vehicleId, totalAmount }) => {
  const [form, setForm] = useState({
    startDate: null,
    endDate: null,
    pickupLocation: "",
    dropoffLocation: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: undefined });
  };

  const handleDateChange = (date, name) => {
    setForm({ ...form, [name]: date });
    setFormErrors({ ...formErrors, [name]: undefined });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.startDate) errors.startDate = "Please select pick-up date.";
    if (!form.endDate) errors.endDate = "Please select drop-off date.";
    if (form.startDate && form.endDate) {
      if (dayjs(form.endDate).isBefore(dayjs(form.startDate))) {
        errors.endDate = "Drop-off date must be after pick-up date.";
      }
    }
    if (!form.pickupLocation.trim())
      errors.pickupLocation = "Please enter pick-up location.";
    if (!form.dropoffLocation.trim())
      errors.dropoffLocation = "Please enter drop-off location.";
    return errors;
  };

  // Submit Booking (using userService)
  const submitHandler = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const bookingPayload = {
        vehicleId,
        startDate: form.startDate
          ? dayjs(form.startDate).format("YYYY-MM-DD")
          : "",
        endDate: form.endDate ? dayjs(form.endDate).format("YYYY-MM-DD") : "",
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        totalAmount,
        note: form.note,
      };
      const res = await userService.createBooking(bookingPayload);
      if (res.success && res.data) {
        setMsg("Booking successful! Please pay the car owner upon pick-up.");
        setForm({
          startDate: null,
          endDate: null,
          pickupLocation: "",
          dropoffLocation: "",
          note: "",
        });
      } else {
        setError(
          res.message || "Đặt xe thất bại. Vui lòng thử lại hoặc liên hệ admin."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đặt xe thất bại. Vui lòng thử lại hoặc liên hệ admin."
      );
    }
    setLoading(false);
  };

  return (
    <Form className="booking-form-ui" onSubmit={submitHandler}>
      <div className="booking-form-row">
        <FormGroup className="booking-form-group">
          <label htmlFor="startDate">Pick-up Date</label>
          <DatePicker
            selected={form.startDate}
            onChange={(date) => handleDateChange(date, "startDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={formErrors.startDate ? "input-error" : ""}
            id="startDate"
            name="startDate"
            autoComplete="off"
            minDate={new Date()}
          />
          {formErrors.startDate && (
            <div className="error-text">{formErrors.startDate}</div>
          )}
        </FormGroup>
        <FormGroup className="booking-form-group">
          <label htmlFor="endDate">Drop-off Date</label>
          <DatePicker
            selected={form.endDate}
            onChange={(date) => handleDateChange(date, "endDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={formErrors.endDate ? "input-error" : ""}
            id="endDate"
            name="endDate"
            autoComplete="off"
            minDate={form.startDate || new Date()}
          />
          {formErrors.endDate && (
            <div className="error-text">{formErrors.endDate}</div>
          )}
        </FormGroup>
      </div>
      <div className="booking-form-row">
        <FormGroup className="booking-form-group">
          <label htmlFor="pickupLocation">Pick-up Location</label>
          <input
            type="text"
            name="pickupLocation"
            id="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            className={formErrors.pickupLocation ? "input-error" : ""}
            placeholder="Enter pick-up location"
          />
          {formErrors.pickupLocation && (
            <div className="error-text">{formErrors.pickupLocation}</div>
          )}
        </FormGroup>
        <FormGroup className="booking-form-group">
          <label htmlFor="dropoffLocation">Drop-off Location</label>
          <input
            type="text"
            name="dropoffLocation"
            id="dropoffLocation"
            value={form.dropoffLocation}
            onChange={handleChange}
            className={formErrors.dropoffLocation ? "input-error" : ""}
            placeholder="Enter drop-off location"
          />
          {formErrors.dropoffLocation && (
            <div className="error-text">{formErrors.dropoffLocation}</div>
          )}
        </FormGroup>
      </div>
      <FormGroup className="booking-form-group">
        <label htmlFor="note">Additional Notes (optional)</label>
        <textarea
          name="note"
          id="note"
          rows={3}
          value={form.note}
          onChange={handleChange}
          placeholder="Enter notes if needed"
        />
      </FormGroup>
      <Button
        type="submit"
        color="primary"
        className="booking-form-btn"
        disabled={loading}
      >
        {loading ? "Booking..." : "Book Now"}
      </Button>
      <div className="booking-form-note">
        * Payment will be made directly to the car owner upon pick-up.
      </div>
      {msg && (
        <Alert color="success" className="booking-form-alert">
          {msg}
        </Alert>
      )}
      {error && (
        <Alert color="danger" className="booking-form-alert">
          {error}
        </Alert>
      )}
    </Form>
  );
};

export default BookingForm;
