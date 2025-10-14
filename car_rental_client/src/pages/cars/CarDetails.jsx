import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Helmet from "../../components/Helmet/Helmet";
import { useParams } from "react-router-dom";
import BookingForm from "../../components/UI/BookingForm";
import PaymentMethod from "../../components/UI/PaymentMethod";
import CarImageGallery from "../../components/UI/CarImageGallery";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { vehicleService } from "../../services/vehicleService";
import "../../styles/car-info-grid.css";

const CarDetails = () => {
  const { slug } = useParams(); // slug chính là UUID của xe
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchCarDetail = async () => {
      setLoading(true);
      const res = await vehicleService.getVehicleDetail(slug);
      if (res.success && res.data) {
        setCar(res.data);
      } else {
        setCar(null);
        // Optionally show error toast
      }
      setLoading(false);
    };
    fetchCarDetail();
  }, [slug]);

  if (loading) {
    return (
      <Helmet title="Car Details">
        <section>
          <Container>
            <Row>
              <Col>
                <div className="w-100 text-center">Loading car details...</div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>
    );
  }

  if (!car) {
    return (
      <Helmet title="Car Details">
        <section>
          <Container>
            <Row>
              <Col>
                <div className="w-100 text-center">
                  Vehicle not found or unavailable.
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>
    );
  }

  return (
    <Helmet title={car.vehicleName}>
      <section>
        <Container>
          <Row>
            <Col lg="6">
              <CarImageGallery
                images={car.imageList || []}
                carName={car.vehicleName}
              />
            </Col>

            <Col lg="6">
              <div className="car__info">
                <h2 className="section__title">{car.vehicleName}</h2>

                <div className=" d-flex align-items-center gap-5 mb-4 mt-3">
                  <h6 className="rent__price fw-bold fs-4">
                    ${car.dailyPrice}.00 / Day
                  </h6>

                  <span className=" d-flex align-items-center gap-2">
                    <span style={{ color: "#f9a826" }}>
                      <i className="ri-star-s-fill"></i>
                      <i className="ri-star-s-fill"></i>
                      <i className="ri-star-s-fill"></i>
                      <i className="ri-star-s-fill"></i>
                      <i className="ri-star-s-fill"></i>
                    </span>
                    ({car.rating || 0} ratings)
                  </span>
                </div>

                <p className="section__description">{car.description}</p>

                <div className="car-info-grid mt-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-building-2-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Brand:</span>
                          <span className="info-value">{car.brand}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-roadster-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Model:</span>
                          <span className="info-value">{car.model}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-calendar-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Year:</span>
                          <span className="info-value">{car.year}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-palette-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Color:</span>
                          <span className="info-value">{car.color}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-settings-2-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Transmission:</span>
                          <span className="info-value">{car.transmission}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-gas-station-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Fuel Type:</span>
                          <span className="info-value">{car.fuelType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-wheelchair-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Seats:</span>
                          <span className="info-value">
                            {car.vehicleSeat} seats
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <div className="car-info-item d-flex align-items-center gap-2">
                        <i
                          className="ri-map-pin-line"
                          style={{ color: "#f9a826", fontSize: "1.2rem" }}
                        ></i>
                        <div>
                          <span className="info-label">Location:</span>
                          <span className="info-value">{car.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                {car.features && car.features.length > 0 && (
                  <div className="car-features mt-4">
                    <h5 className="mb-3 fw-bold text-dark">
                      <i
                        className="ri-star-line me-2"
                        style={{ color: "#f9a826" }}
                      ></i>
                      Features:
                    </h5>
                    <div className="features-list">
                      {car.features.map((feature, index) => (
                        <span key={index} className="feature-badge">
                          <i className="ri-check-line me-2"></i>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Section */}
                {car.latitude && car.longitude && (
                  <div className="location-info mt-4">
                    <h5 className="mb-3 fw-bold">
                      <i
                        className="ri-map-pin-line me-2"
                        style={{ color: "#f9a826" }}
                      ></i>
                      Location
                    </h5>

                    <div
                      className="map-container mb-3"
                      style={{
                        height: "200px",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <MapContainer
                        center={[car.latitude, car.longitude]}
                        zoom={17}
                        scrollWheelZoom={false}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[car.latitude, car.longitude]}
                          icon={window.redMarkerIcon || window.redMarkerIconSVG}
                        />
                      </MapContainer>
                    </div>

                    <div
                      className="location-details p-3"
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <div className="mb-2">
                        <strong>Address:</strong>{" "}
                        {car.address || "Address not available"}
                      </div>
                      <div>
                        <strong>Coordinates:</strong> {car.latitude.toFixed(6)},{" "}
                        {car.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>

            <Col lg="7" className="mt-5">
              <div className="booking-info mt-5">
                <h5 className="mb-4 fw-bold ">Booking Information</h5>
                <BookingForm />
              </div>
            </Col>

            <Col lg="5" className="mt-5">
              <div className="payment__info mt-5">
                <h5 className="mb-4 fw-bold ">Payment Information</h5>
                <PaymentMethod />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default CarDetails;
