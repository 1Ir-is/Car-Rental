import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Alert, CardBody } from "reactstrap";
import { favoriteService } from "../../services/favoriteService";

const cardStyle = {
  border: "none",
  borderRadius: "18px",
  boxShadow: "0 4px 24px 0 rgba(30,42,73,.12)",
  overflow: "hidden",
  transition: "transform 0.2s",
  background: "#fff",
  position: "relative",
};

const imageStyle = {
  height: "220px",
  objectFit: "cover",
  width: "100%",
  borderTopLeftRadius: "18px",
  borderTopRightRadius: "18px",
  filter: "brightness(0.93)",
  transition: "filter 0.2s",
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "220px",
  background:
    "linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.45) 100%)",
  zIndex: 1,
};

const titleStyle = {
  fontWeight: 700,
  fontSize: "1.2rem",
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const descStyle = {
  color: "#64748b",
  fontSize: "1rem",
  minHeight: "48px",
};

const btnStyle = {
  borderRadius: "8px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  padding: "8px 20px",
  fontSize: "1rem",
  background: "linear-gradient(90deg,#2563eb 0%,#1e40af 100%)",
  border: "none",
};

const FollowedVehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    favoriteService
      .getFollowedVehicles()
      .then((res) => {
        if (Array.isArray(res.data)) setVehicles(res.data);
        else setVehicles([]);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h2
            className="fw-bold"
            style={{ fontSize: "2.2rem", color: "#1e293b" }}
          >
            Followed Vehicles
          </h2>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            Your favorite vehicles are saved here for quick access.
          </p>
        </Col>
      </Row>
      <Row>
        {loading ? (
          <Col>
            <Alert color="info">Loading your followed vehicles...</Alert>
          </Col>
        ) : vehicles.length === 0 ? (
          <Col>
            <Alert color="info">You are not following any vehicles yet.</Alert>
            <Button
              color="primary"
              style={btnStyle}
              onClick={() => navigate("/cars")}
            >
              Browse Cars
            </Button>
          </Col>
        ) : (
          vehicles.map((vehicle, idx) => (
            <Col md="4" sm="6" xs="12" className="mb-4" key={vehicle.id}>
              <div
                style={{ ...cardStyle, cursor: "pointer" }}
                className="vehicle-card"
                onClick={() => navigate(`/cars/${vehicle.id}`)}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={
                      vehicle.imageList?.[0] ||
                      vehicle.imgUrl ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={vehicle.vehicleName || vehicle.name}
                    style={imageStyle}
                    className="vehicle-card-img"
                  />
                  <div style={overlayStyle}></div>
                  <span
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      zIndex: 2,
                      background: "#fff",
                      color: "#1e40af",
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 13,
                      boxShadow: "0 2px 8px rgba(30,42,73,.08)",
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>
                <CardBody style={{ zIndex: 2, position: "relative" }}>
                  <h5 style={titleStyle}>
                    {vehicle.vehicleName || vehicle.name}
                  </h5>
                  <p style={descStyle}>
                    {vehicle.description || "No description"}
                  </p>
                  <Button
                    color="primary"
                    style={btnStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cars/${vehicle.id}`);
                    }}
                  >
                    <i className="ri-eye-line me-2"></i> View Details
                  </Button>
                </CardBody>
              </div>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default FollowedVehicles;
