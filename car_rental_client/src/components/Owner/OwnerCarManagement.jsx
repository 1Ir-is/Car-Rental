import React, { useState, useEffect, useContext, useRef } from "react";
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
  Spinner,
  Alert,
} from "reactstrap";
import ownerService from "../../services/ownerService";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";
import "../../styles/car-detail-modal.css";
import "../../styles/cars-table.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  unavailable: "Unavailable",
};

const statusColors = {
  pending: "info",
  approved: "success",
  rejected: "danger",
  available: "success",
  rented: "warning",
  maintenance: "danger",
  unavailable: "secondary",
};

const OwnerCarManagement = ({ setActiveSection, setEditingCar }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMyCars = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          setError("User not found. Please login again.");
          return;
        }

        const response = await ownerService.getMyVehicles(user.id);

        if (response.success) {
          console.log("🚗 Vehicles data:", response.data); // Debug log
          setCars(response.data || []);
        } else {
          setError(response.message || "Failed to fetch vehicles");
          toast.error("Failed to load your vehicles");
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError("Network error. Please try again.");
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCars();
  }, [user?.id]);

  const handleDeleteCar = async (car) => {
    const result = await Swal.fire({
      title: `Bạn có chắc muốn xóa xe "${car.vehicleName || car.name}"?`,
      text: "Thao tác này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await ownerService.deleteVehicle(car.id);
        if (response.success) {
          Swal.fire({
            title: "Đã xóa!",
            text: "Xe đã được xóa thành công.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setCars((prev) => prev.filter((c) => c.id !== car.id));
        } else {
          Swal.fire({
            title: "Lỗi",
            text: response.message || "Xóa xe thất bại.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Xóa xe thất bại, vui lòng thử lại.",
          icon: "error",
        });
      }
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    const value = (status || "").toLowerCase();
    return statusColors[value] || "secondary";
  };

  const getStatusText = (status) => {
    const value = (status || "").toLowerCase();
    console.log("🔍 Status debug:", {
      original: status,
      lowercased: value,
      mapped: statusLabels[value],
    }); // Debug log
    return statusLabels[value] || "Unknown";
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

  const handleEditCar = (car) => {
    setEditingCar(car);
    setActiveSection("edit-car");
  };

  const closeDetailModal = () => {
    setSelectedCar(null);
    setShowDetailModal(false);
  };

  if (loading) {
    return (
      <div className="owner-car-management">
        <div className="section-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>Manage Cars</h4>
            <p className="text-muted">Loading your vehicle fleet...</p>
          </div>
        </div>
        <div className="text-center py-5">
          <Spinner size="lg" color="primary" />
          <p className="mt-3">Loading cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-car-management">
        <div className="section-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>Manage Cars</h4>
            <p className="text-muted">Manage your vehicle fleet</p>
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
        <Alert color="danger">
          <i className="ri-error-warning-line me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="owner-car-management">
        <div className="section-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>Manage Cars</h4>
            <p className="text-muted">No vehicles in your fleet yet</p>
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
        <Card className="text-center py-5">
          <CardBody>
            <i className="ri-car-line display-1 text-muted mb-3"></i>
            <h5>No Cars Found</h5>
            <p className="text-muted">
              You haven't added any vehicles to your fleet yet.
            </p>
            <Button color="primary" onClick={() => setActiveSection("add-car")}>
              <i className="ri-add-circle-line me-2"></i>
              Add Your First Car
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

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
              <thead className="table-header">
                <tr>
                  <th width="32%">CAR DETAILS</th>
                  <th width="15%" className="text-center">
                    PRICE/DAY
                  </th>
                  <th width="10%" className="text-center">
                    STATUS
                  </th>
                  <th width="8%" className="text-center">
                    BOOKINGS
                  </th>
                  <th width="10%" className="text-center">
                    RATING
                  </th>
                  <th width="25%" className="text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCars.map((car) => (
                  <tr key={car.id} className="table-row">
                    <td className="car-details-td">
                      <div className="car-details-cell">
                        <div className="car-image-thumb">
                          {car.imageList && car.imageList.length > 0 ? (
                            <img
                              src={car.imageList[0]}
                              alt={car.vehicleName || car.name}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x60?text=Car";
                              }}
                            />
                          ) : (
                            <div className="no-image">
                              <i className="ri-car-line"></i>
                            </div>
                          )}
                        </div>
                        <div className="car-info">
                          <h6 className="car-name">
                            {car.vehicleName || car.name}
                          </h6>
                          <div className="car-details-text">
                            <span className="car-brand">{car.brand}</span>
                            <span className="car-model">{car.model}</span>
                            <span className="car-year">({car.year})</span>
                          </div>
                          <small className="car-license">
                            {car.licensePlate}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center price-td">
                      <div className="price-wrapper">
                        <span className="price-amount">
                          ${car.dailyPrice || car.price}
                        </span>
                        <small className="price-period">/day</small>
                      </div>
                    </td>
                    <td className="text-center status-td">
                      <Badge
                        color={getStatusColor(car.status)}
                        className="status-badge"
                      >
                        {getStatusText(car.status)}
                      </Badge>
                    </td>
                    <td className="text-center bookings-td">
                      <div className="bookings-wrapper">
                        <span className="bookings-count">
                          {car.bookings || 0}
                        </span>
                      </div>
                    </td>
                    <td className="text-center rating-td">
                      <div className="rating-wrapper">
                        <i className="ri-star-fill text-warning me-1"></i>
                        <span className="rating-value">
                          {car.rating ? car.rating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="text-center actions-td">
                      <div className="action-buttons">
                        <Button
                          color="info"
                          size="sm"
                          className="action-btn details-btn"
                          onClick={() => openDetailModal(car)}
                        >
                          <i className="ri-eye-line"></i>
                          <span className="btn-text">Details</span>
                        </Button>
                        <Button
                          color="warning"
                          size="sm"
                          className="action-btn edit-btn"
                          onClick={() => handleEditCar(car)}
                        >
                          <i className="ri-edit-line"></i>
                          <span className="btn-text">Edit</span>
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCar(car)}
                        >
                          <i className="ri-delete-bin-line"></i>
                          <span className="btn-text">Delete</span>
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
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink
                previous
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page} active={currentPage === page}>
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

const CarDetailModal = ({ car, isOpen, toggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen) setCurrentImageIndex(0);
  }, [isOpen, car?.id]);

  if (!car) return null;

  // Go to location function
  const goToLocation = () => {
    if (mapRef.current && car.latitude && car.longitude) {
      const map = mapRef.current;
      map.setView([car.latitude, car.longitude], 17, {
        animate: true,
        duration: 1,
      });
    }
  };

  const nextImage = () => {
    if (car.imageList && car.imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === car.imageList.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (car.imageList && car.imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? car.imageList.length - 1 : prev - 1
      );
    }
  };

  const getStatusColor = (status) => {
    const value = (status || "").toLowerCase();
    switch (value) {
      case "pending":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "available":
        return "success";
      case "rented":
        return "warning";
      case "maintenance":
        return "danger";
      case "unavailable":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      className="car-detail-modal"
    >
      <ModalHeader toggle={toggle} className="modal-header-custom">
        <div className="modal-header-content">
          <div className="car-title-section">
            <h4 className="car-title">{car.name}</h4>
            <div className="car-subtitle">
              <span className="car-brand-model">
                {car.brand} {car.model}
              </span>
              <span className="car-year-license">
                ({car.year}) • {car.licensePlate}
              </span>
            </div>
          </div>
          <div className="status-info-section">
            <Badge
              color={getStatusColor(car.status)}
              className="status-badge-large"
            >
              {car.status?.toUpperCase()}
            </Badge>
            <div className="quick-info">
              <div className="info-item">
                <i className="ri-star-fill text-warning"></i>
                <span>{car.rating ? car.rating.toFixed(1) : "N/A"}</span>
              </div>
              <div className="info-item">
                <i className="ri-calendar-check-line text-primary"></i>
                <span>{car.bookings || 0} bookings</span>
              </div>
            </div>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="p-0">
        <Row className="g-0">
          {/* Image Gallery */}
          <Col lg="6" className="image-gallery-section">
            <div className="image-gallery">
              <div className="main-image-container">
                {car.imageList && car.imageList.length > 0 ? (
                  <>
                    <img
                      src={car.imageList[currentImageIndex]}
                      alt={`${car.name} - ${currentImageIndex + 1}`}
                      className="main-image"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/600x400?text=Car+Photo";
                      }}
                    />

                    {/* Navigation Arrows */}
                    {car.imageList.length > 1 && (
                      <>
                        <button
                          className="nav-btn prev-btn"
                          onClick={prevImage}
                        >
                          <i className="ri-arrow-left-line"></i>
                        </button>
                        <button
                          className="nav-btn next-btn"
                          onClick={nextImage}
                        >
                          <i className="ri-arrow-right-line"></i>
                        </button>

                        {/* Image Counter */}
                        <div className="image-counter">
                          {currentImageIndex + 1} / {car.imageList.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="no-image-placeholder">
                    <i className="ri-image-line"></i>
                    <p>No images available</p>
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {car.imageList && car.imageList.length > 1 && (
                  <div className="image-thumbnails mt-3">
                    {car.imageList.map((image, index) => (
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
            </div>
          </Col>

          {/* Car Details */}
          <Col lg="6" className="car-details-section">
            <div className="p-4">
              <div className="price-section mb-3">
                <h3 className="price-display text-primary">
                  ${car.price || car.dailyPrice}/day
                </h3>
                <div className="rating-display">
                  <i className="ri-star-fill text-warning me-1"></i>
                  <span>
                    {car.rating ? car.rating.toFixed(1) : "N/A"} (
                    {car.bookings || 0} bookings)
                  </span>
                </div>
              </div>

              <div className="description-section mb-4">
                <h6>Description</h6>
                <p className="text-muted">
                  {car.description || "No description available"}
                </p>
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
                      <span className="spec-label">Seats:</span>{" "}
                      {car.seats || car.vehicleSeat}
                    </div>
                  </Col>
                </Row>
              </div>

              {car.features && car.features.length > 0 && (
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
              )}

              {car.latitude && car.longitude && (
                <div className="car-location-section mt-4">
                  <div className="location-header mb-3">
                    <h6 className="location-title">LOCATION</h6>
                    <Button
                      color="primary"
                      size="sm"
                      className="go-to-location-btn"
                      onClick={goToLocation}
                    >
                      <i className="ri-map-pin-line me-1"></i>
                      Go to Location
                    </Button>
                  </div>
                  <div className="map-container">
                    <MapContainer
                      center={[car.latitude, car.longitude]}
                      zoom={17}
                      scrollWheelZoom={false}
                      style={{ width: "100%", height: "220px" }}
                      ref={mapRef}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[car.latitude, car.longitude]}
                        icon={window.redMarkerIcon || window.redMarkerIconSVG}
                      />
                    </MapContainer>
                  </div>
                  <div className="location-info">
                    <div className="location-text">
                      <strong>Address: </strong>
                      {car.address || "Address not available"}
                    </div>
                    <div className="coordinates-text">
                      <strong>Coordinates: </strong>
                      {car.latitude.toFixed(6)}, {car.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default OwnerCarManagement;
