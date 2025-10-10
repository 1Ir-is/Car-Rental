import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const OwnerCarManagement = ({ setActiveSection }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  // Sample data với nhiều xe để test pagination
  const cars = [
    {
      id: 1,
      name: "Toyota Camry 2023",
      brand: "Toyota",
      model: "Camry",
      year: 2023,
      price: 45,
      status: "available",
      bookings: 12,
      rating: 4.8,
      licensePlate: "30A-12345",
      color: "Silver",
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      description:
        "A reliable and comfortable sedan perfect for business trips and family outings.",
      images: [
        "https://via.placeholder.com/600x400?text=Toyota+Camry+Front",
        "https://via.placeholder.com/600x400?text=Toyota+Camry+Side",
        "https://via.placeholder.com/600x400?text=Toyota+Camry+Interior",
        "https://via.placeholder.com/600x400?text=Toyota+Camry+Back",
      ],
      features: [
        "GPS Navigation",
        "Bluetooth",
        "Air Conditioning",
        "Backup Camera",
        "Cruise Control",
      ],
    },
    {
      id: 2,
      name: "Honda Civic 2022",
      brand: "Honda",
      model: "Civic",
      year: 2022,
      price: 35,
      status: "rented",
      bookings: 8,
      rating: 4.5,
      licensePlate: "30B-67890",
      color: "White",
      transmission: "Manual",
      fuelType: "Petrol",
      seats: 5,
      description:
        "Sporty and fuel-efficient compact car, ideal for city driving.",
      images: [
        "https://via.placeholder.com/600x400?text=Honda+Civic+Front",
        "https://via.placeholder.com/600x400?text=Honda+Civic+Side",
        "https://via.placeholder.com/600x400?text=Honda+Civic+Interior",
      ],
      features: [
        "Apple CarPlay",
        "Android Auto",
        "Lane Keeping Assist",
        "Honda Sensing",
      ],
    },
    {
      id: 3,
      name: "BMW X5 2024",
      brand: "BMW",
      model: "X5",
      year: 2024,
      price: 85,
      status: "maintenance",
      bookings: 15,
      rating: 4.9,
      licensePlate: "30C-11111",
      color: "Black",
      transmission: "Automatic",
      fuelType: "Hybrid",
      seats: 7,
      description:
        "Luxury SUV with premium features and exceptional performance.",
      images: [
        "https://via.placeholder.com/600x400?text=BMW+X5+Front",
        "https://via.placeholder.com/600x400?text=BMW+X5+Side",
        "https://via.placeholder.com/600x400?text=BMW+X5+Interior",
        "https://via.placeholder.com/600x400?text=BMW+X5+Engine",
        "https://via.placeholder.com/600x400?text=BMW+X5+Back",
      ],
      features: [
        "Premium Sound System",
        "Panoramic Roof",
        "Adaptive Suspension",
        "Wireless Charging",
        "Gesture Control",
      ],
    },
    // Thêm nhiều xe để test pagination
    ...Array.from({ length: 25 }, (_, i) => ({
      id: i + 4,
      name: `Car Model ${i + 4}`,
      brand: ["Toyota", "Honda", "BMW", "Mercedes", "Audi"][i % 5],
      model: `Model ${i + 4}`,
      year: 2020 + (i % 4),
      price: 30 + (i % 50),
      status: ["available", "rented", "maintenance"][i % 3],
      bookings: Math.floor(Math.random() * 20),
      rating: 4.0 + Math.random(),
      licensePlate: `30${String.fromCharCode(65 + (i % 26))}-${String(
        i + 4
      ).padStart(5, "0")}`,
      color: ["Red", "Blue", "White", "Black", "Silver"][i % 5],
      transmission: ["Automatic", "Manual"][i % 2],
      fuelType: ["Petrol", "Diesel", "Hybrid", "Electric"][i % 4],
      seats: [4, 5, 7][i % 3],
      description: `Description for car model ${i + 4}`,
      images: [
        `https://via.placeholder.com/600x400?text=Car+${i + 4}+Image+1`,
        `https://via.placeholder.com/600x400?text=Car+${i + 4}+Image+2`,
      ],
      features: ["Feature 1", "Feature 2", "Feature 3"],
    })),
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "rented":
        return "warning";
      case "maintenance":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "rented":
        return "Rented";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(cars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCars = cars.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openDetailModal = (car) => {
    setSelectedCar(car);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedCar(null);
    setShowDetailModal(false);
  };

  return (
    <div className="owner-car-management">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Manage Cars</h4>
          <p className="text-muted">
            Manage your vehicle fleet ({cars.length} total cars)
          </p>
        </div>
        <Button
          color="primary"
          className="add-car-btn"
          onClick={() => setActiveSection("add-car")}
        >
          <i className="ri-add-circle-line me-2"></i>
          Add New Car
        </Button>
      </div>

      {/* Cars Table */}
      <Card className="cars-table-card">
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table className="cars-table mb-0" hover>
              <thead>
                <tr>
                  <th>Car Details</th>
                  <th>Price/Day</th>
                  <th>Status</th>
                  <th>Bookings</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <div className="car-details-cell">
                        <div className="car-image-thumb">
                          <img
                            src={car.images[0]}
                            alt={car.name}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x60?text=Car";
                            }}
                          />
                        </div>
                        <div className="car-info">
                          <h6 className="car-name mb-1">{car.name}</h6>
                          <small className="text-muted">
                            {car.licensePlate} • {car.color}
                          </small>
                          <br />
                          <small className="text-muted">
                            {car.transmission} • {car.fuelType}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="price-text">${car.price}/day</span>
                    </td>
                    <td>
                      <Badge
                        color={getStatusColor(car.status)}
                        className="status-badge"
                      >
                        {getStatusText(car.status)}
                      </Badge>
                    </td>
                    <td>
                      <span className="bookings-count">{car.bookings}</span>
                    </td>
                    <td>
                      <div className="rating-cell">
                        <i className="ri-star-fill text-warning me-1"></i>
                        <span>{car.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openDetailModal(car)}
                        >
                          <i className="ri-eye-line me-1"></i>
                          Details
                        </Button>
                        <Button color="primary" size="sm" className="me-2">
                          <i className="ri-edit-line me-1"></i>
                          Edit
                        </Button>
                        <Button color="danger" size="sm">
                          <i className="ri-delete-bin-line me-1"></i>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, cars.length)} of{" "}
            {cars.length} cars
          </div>
          <Pagination className="mb-0">
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink
                previous
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page} active={page === currentPage}>
                <PaginationLink onClick={() => handlePageChange(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink
                next
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </Pagination>
        </div>
      )}

      {/* Car Detail Modal */}
      <CarDetailModal
        car={selectedCar}
        isOpen={showDetailModal}
        toggle={closeDetailModal}
      />
    </div>
  );
};

// Car Detail Modal Component
const CarDetailModal = ({ car, isOpen, toggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!car) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "rented":
        return "warning";
      case "maintenance":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      className="car-detail-modal"
    >
      <ModalHeader toggle={toggle}>
        <div className="modal-title-section">
          <h4 className="mb-1">{car.name}</h4>
          <Badge color={getStatusColor(car.status)} className="ms-2">
            {car.status}
          </Badge>
        </div>
      </ModalHeader>
      <ModalBody className="p-0">
        <Row className="g-0">
          {/* Image Gallery */}
          <Col lg="6" className="image-gallery-section">
            <div className="image-gallery">
              <div className="main-image-container">
                <img
                  src={car.images[currentImageIndex]}
                  alt={`${car.name} - ${currentImageIndex + 1}`}
                  className="main-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x400?text=Car+Photo";
                  }}
                />

                {car.images.length > 1 && (
                  <>
                    <button className="nav-btn prev-btn" onClick={prevImage}>
                      <i className="ri-arrow-left-line"></i>
                    </button>
                    <button className="nav-btn next-btn" onClick={nextImage}>
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </>
                )}

                <div className="image-counter">
                  {currentImageIndex + 1} / {car.images.length}
                </div>
              </div>

              {car.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {car.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/100x75?text=Thumb";
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Car Details */}
          <Col lg="6" className="car-details-section">
            <div className="p-4">
              <div className="price-section mb-3">
                <h3 className="price-display text-primary">${car.price}/day</h3>
                <div className="rating-display">
                  <i className="ri-star-fill text-warning me-1"></i>
                  <span>
                    {car.rating.toFixed(1)} ({car.bookings} bookings)
                  </span>
                </div>
              </div>

              <div className="description-section mb-4">
                <h6>Description</h6>
                <p className="text-muted">{car.description}</p>
              </div>

              <div className="specifications-section mb-4">
                <h6>Specifications</h6>
                <Row>
                  <Col xs="6">
                    <div className="spec-item">
                      <i className="ri-car-line me-2 text-muted"></i>
                      <span className="spec-label">Brand:</span> {car.brand}
                    </div>
                    <div className="spec-item">
                      <i className="ri-roadster-line me-2 text-muted"></i>
                      <span className="spec-label">Model:</span> {car.model}
                    </div>
                    <div className="spec-item">
                      <i className="ri-calendar-line me-2 text-muted"></i>
                      <span className="spec-label">Year:</span> {car.year}
                    </div>
                    <div className="spec-item">
                      <i className="ri-palette-line me-2 text-muted"></i>
                      <span className="spec-label">Color:</span> {car.color}
                    </div>
                  </Col>
                  <Col xs="6">
                    <div className="spec-item">
                      <i className="ri-license-line me-2 text-muted"></i>
                      <span className="spec-label">License:</span>{" "}
                      {car.licensePlate}
                    </div>
                    <div className="spec-item">
                      <i className="ri-settings-line me-2 text-muted"></i>
                      <span className="spec-label">Transmission:</span>{" "}
                      {car.transmission}
                    </div>
                    <div className="spec-item">
                      <i className="ri-gas-station-line me-2 text-muted"></i>
                      <span className="spec-label">Fuel:</span> {car.fuelType}
                    </div>
                    <div className="spec-item">
                      <i className="ri-group-line me-2 text-muted"></i>
                      <span className="spec-label">Seats:</span> {car.seats}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="features-section">
                <h6>Features</h6>
                <div className="features-list">
                  {car.features.map((feature, index) => (
                    <Badge
                      key={index}
                      color="light"
                      className="feature-badge me-2 mb-2"
                    >
                      <i className="ri-check-line me-1 text-success"></i>
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default OwnerCarManagement;
