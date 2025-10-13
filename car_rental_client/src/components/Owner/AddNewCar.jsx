import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import vehicleService from "../../services/vehicleService";
import { toast } from "react-toastify";
import FullPageLoader from "../UI/FullPageLoader";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Spinner } from "reactstrap";

function MapFlyTo({ position, zoom, flyTrigger }) {
  const map = useMap();
  React.useEffect(() => {
    if (flyTrigger) {
      // Chỉ zoom/fly khi có trigger
      map.setView(position, zoom, { animate: true });
    }
  }, [flyTrigger, position, zoom, map]);
  return null;
}
function LocationPicker({ onLocationChange }) {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState([16.0544, 108.2022]);
  const [address, setAddress] = useState("");
  const [zoom, setZoom] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flyToMarker, setFlyToMarker] = useState(false); // trigger "quay về marker"

  // Tìm địa chỉ bằng Nominatim API
  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        setZoom(19);
        setAddress(data[0].display_name);
        if (onLocationChange)
          onLocationChange({
            latitude: lat,
            longitude: lng,
            address: data[0].display_name,
          });
        setFlyToMarker(true);
      } else {
        setError("No location found with this address!");
      }
    } catch (err) {
      setError("Network error or Nominatim not responding!");
    } finally {
      setLoading(false);
      setTimeout(() => setFlyToMarker(false), 500); // reset trigger sau khi fly
    }
  };

  // Click map cũng zoom sát
  const handleMapClick = (e) => {
    setPosition([e.latlng.lat, e.latlng.lng]);
    setZoom(19);
    setAddress("");
    if (onLocationChange)
      onLocationChange({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        address: "",
      });
    setFlyToMarker(true);
    setTimeout(() => setFlyToMarker(false), 500);
  };

  // Nút "Quay lại vị trí marker"
  const handleFlyToMarker = () => {
    setFlyToMarker(true);
    setZoom(19); // zoom sát luôn
    setTimeout(() => setFlyToMarker(false), 500);
  };

  return (
    <div>
      <div className="location-search-container">
        <div className="search-input-group">
          <i className="ri-map-pin-line search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Enter address or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            className="search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" color="white" />
            ) : (
              <>
                <i className="ri-search-line me-1"></i>
                Find Location
              </>
            )}
          </Button>
        </div>
        {/* Center to marker button */}
        <Button
          className="center-marker-btn"
          onClick={handleFlyToMarker}
          title="Center to marker location"
        >
          <i className="ri-focus-3-line"></i>
        </Button>
      </div>

      {error && (
        <div className="location-error">
          <i className="ri-error-warning-line me-1"></i>
          {error}
        </div>
      )}

      <MapContainer
        center={position}
        zoom={zoom}
        style={{ width: "100%", height: "300px", marginTop: "12px" }}
        whenCreated={(map) => map.on("click", handleMapClick)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFlyTo position={position} zoom={zoom} flyTrigger={flyToMarker} />
        <Marker position={position} />
      </MapContainer>

      <div className="location-info">
        <div className="info-item">
          <strong>Address:</strong> {address || "Not specified"}
        </div>
        <div className="info-item">
          <strong>Coordinates:</strong> {position[0].toFixed(6)},{" "}
          {position[1].toFixed(6)}
        </div>
      </div>
    </div>
  );
}

const AddNewCar = () => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    transmission: "automatic",
    fuelType: "petrol",
    seats: 5,
    price: "",
    description: "",
    features: [],
    status: "available",
    address: "",
    placeId: "",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For map location
  const [location, setLocation] = useState({
    latitude: 16.0544, // Default Da Nang
    longitude: 108.2022,
  });

  const colorOptions = [
    "White",
    "Black",
    "Silver",
    "Red",
    "Blue",
    "Gray",
    "Brown",
    "Green",
    "Yellow",
    "Orange",
  ];
  const transmissionOptions = [
    { value: "automatic", label: "Automatic" },
    { value: "manual", label: "Manual" },
    { value: "cvt", label: "CVT" },
  ];
  const fuelTypeOptions = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "hybrid", label: "Hybrid" },
    { value: "electric", label: "Electric" },
  ];
  const featureOptions = [
    "GPS Navigation",
    "Bluetooth",
    "Air Conditioning",
    "Backup Camera",
    "Cruise Control",
    "Apple CarPlay",
    "Android Auto",
    "Sunroof",
    "Leather Seats",
    "Heated Seats",
    "Wireless Charging",
    "Premium Sound System",
    "Adaptive Cruise Control",
    "Lane Keeping Assist",
    "Parking Sensors",
    "Keyless Entry",
    "Push Start",
    "USB Ports",
    "Wi-Fi Hotspot",
  ];

  // Handle form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "features") {
      setFormData((prev) => ({
        ...prev,
        features: checked
          ? [...prev.features, value]
          : prev.features.filter((feature) => feature !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    if (images.length + files.length > maxImages) {
      setErrors((prev) => ({
        ...prev,
        images: `Maximum ${maxImages} images allowed`,
      }));
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));
    setImages((prev) => [...prev, ...newImages]);
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (imageId) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      prev.forEach((img) => {
        if (img.id === imageId) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Car name is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.licensePlate.trim())
      newErrors.licensePlate = "License plate is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    const currentYear = new Date().getFullYear();
    if (formData.year < 1990 || formData.year > currentYear + 1) {
      newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
    }
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    const licensePlateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}$/;
    if (
      formData.licensePlate &&
      !licensePlateRegex.test(formData.licensePlate)
    ) {
      newErrors.licensePlate = "License plate format should be: 30A-12345";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const vehicleDTO = {
      vehicleName: formData.name,
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      color: formData.color,
      licensePlate: formData.licensePlate,
      vehicleSeat: formData.seats,
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      description: formData.description,
      title: formData.name,
      dailyPrice: formData.price,
      status: formData.status,
      features: formData.features,
      address: formData.address,
      latitude: location.latitude,
      longitude: location.longitude,
      placeId: formData.placeId,
    };

    const imageFiles = images.map((img) => img.file);

    try {
      const response = await vehicleService.createVehicle(
        vehicleDTO,
        imageFiles
      );
      if (response.success) {
        // Show success toast
        toast.success("Car added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onOpen: () => {
            // Scroll to top when toast appears
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }, 100);
          },
        });

        // Reset form
        setFormData({
          name: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          licensePlate: "",
          transmission: "automatic",
          fuelType: "petrol",
          seats: 5,
          price: "",
          description: "",
          features: [],
          status: "available",
          address: "",
          placeId: "",
        });
        setImages([]);
        setLocation({ latitude: 16.0544, longitude: 108.2022 });
      } else {
        toast.error(
          response.message || "Failed to add car. Please try again.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
    } catch (error) {
      toast.error("Failed to add car. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Full Page Loader */}
      <FullPageLoader isLoading={isSubmitting} tip="Adding new car..." />

      <div className="add-new-car">
        <div className="section-header mb-4">
          <h4>Add New Car</h4>
          <p className="text-muted">Add a new vehicle to your rental fleet</p>
        </div>

        {errors.submit && (
          <Alert color="danger" className="mb-4">
            <i className="ri-error-warning-line me-2"></i>
            {errors.submit}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Basic Information */}
            <Col lg="8">
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="ri-car-line me-2"></i>
                    Basic Information
                  </h5>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">
                          Car Name <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          placeholder="e.g., Toyota Camry 2023"
                          value={formData.name}
                          onChange={handleInputChange}
                          invalid={!!errors.name}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="brand">
                          Brand <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="brand"
                          id="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          placeholder="e.g., Toyota, Honda, BMW..."
                          invalid={!!errors.brand}
                        />
                        {errors.brand && (
                          <div className="invalid-feedback">{errors.brand}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="model">
                          Model <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="model"
                          id="model"
                          placeholder="e.g., Camry"
                          value={formData.model}
                          onChange={handleInputChange}
                          invalid={!!errors.model}
                        />
                        {errors.model && (
                          <div className="invalid-feedback">{errors.model}</div>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <Label for="year">
                          Year <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="number"
                          name="year"
                          id="year"
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          value={formData.year}
                          onChange={handleInputChange}
                          invalid={!!errors.year}
                        />
                        {errors.year && (
                          <div className="invalid-feedback">{errors.year}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="color">
                          Color <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="color"
                          id="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Color</option>
                          {colorOptions.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="licensePlate">
                          License Plate{" "}
                          <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="licensePlate"
                          id="licensePlate"
                          placeholder="30A-12345"
                          value={formData.licensePlate}
                          onChange={handleInputChange}
                          invalid={!!errors.licensePlate}
                        />
                        {errors.licensePlate && (
                          <div className="invalid-feedback">
                            {errors.licensePlate}
                          </div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label for="seats">Seats</Label>
                        <Input
                          type="select"
                          name="seats"
                          id="seats"
                          value={formData.seats}
                          onChange={handleInputChange}
                        >
                          <option value={2}>2 Seats</option>
                          <option value={4}>4 Seats</option>
                          <option value={5}>5 Seats</option>
                          <option value={7}>7 Seats</option>
                          <option value={8}>8 Seats</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label for="transmission">Transmission</Label>
                        <Input
                          type="select"
                          name="transmission"
                          id="transmission"
                          value={formData.transmission}
                          onChange={handleInputChange}
                        >
                          {transmissionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="fuelType">Fuel Type</Label>
                        <Input
                          type="select"
                          name="fuelType"
                          id="fuelType"
                          value={formData.fuelType}
                          onChange={handleInputChange}
                        >
                          {fuelTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="price">
                          Daily Price (USD){" "}
                          <span className="required-asterisk">*</span>
                        </Label>
                        <Input
                          type="number"
                          name="price"
                          id="price"
                          placeholder="45"
                          min="1"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          invalid={!!errors.price}
                        />
                        {errors.price && (
                          <div className="invalid-feedback">{errors.price}</div>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label for="description">
                      Description <span className="required-asterisk">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      name="description"
                      id="description"
                      rows="4"
                      placeholder="Describe the car's features, condition, and any special notes..."
                      value={formData.description}
                      onChange={handleInputChange}
                      invalid={!!errors.description}
                    />
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description}
                      </div>
                    )}
                  </FormGroup>
                </CardBody>
              </Card>

              {/* Features */}
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="ri-settings-line me-2"></i>
                    Features & Amenities
                  </h5>

                  <Row>
                    {featureOptions.map((feature, index) => (
                      <Col md="4" sm="6" key={feature} className="mb-2">
                        <FormGroup check>
                          <Input
                            type="checkbox"
                            name="features"
                            value={feature}
                            checked={formData.features.includes(feature)}
                            onChange={handleInputChange}
                            id={`feature-${index}`}
                          />
                          <Label
                            check
                            for={`feature-${index}`}
                            className="ms-2"
                          >
                            {feature}
                          </Label>
                        </FormGroup>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>

            {/* Images and Status */}
            <Col lg="4">
              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="ri-image-line me-2"></i>
                    Car Images <span className="required-asterisk">*</span>
                  </h5>

                  <FormGroup>
                    <Label for="images">Upload Images (Max 5)</Label>
                    <Input
                      type="file"
                      name="images"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      invalid={!!errors.images}
                    />
                    {errors.images && (
                      <div className="invalid-feedback">{errors.images}</div>
                    )}
                    <small className="text-muted">
                      Supported formats: JPG, PNG, GIF (Max size: 5MB each)
                    </small>
                  </FormGroup>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="image-previews mt-3">
                      <h6>Preview:</h6>
                      <Row>
                        {images.map((image, index) => (
                          <Col xs="6" key={image.id} className="mb-2">
                            <div className="image-preview-item">
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="img-fluid rounded"
                              />
                              <button
                                type="button"
                                className="remove-image-btn-circle"
                                onClick={() => removeImage(image.id)}
                                title="Remove image"
                              >
                                <i className="ri-close-line"></i>
                              </button>
                              {index === 0 && (
                                <span className="primary-badge">Primary</span>
                              )}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="ri-shield-check-line me-2"></i>
                    Status
                  </h5>
                  <FormGroup>
                    <Label for="status">Car Status</Label>
                    <Input
                      type="select"
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Under Maintenance</option>
                    </Input>
                  </FormGroup>
                  <div className="form-summary mt-4">
                    <h6>Summary:</h6>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Images:</strong> {images.length}/5
                      </li>
                      <li>
                        <strong>Features:</strong> {formData.features.length}{" "}
                        selected
                      </li>
                      <li>
                        <strong>Daily Rate:</strong>{" "}
                        {formData.price ? `$${formData.price}` : "Not set"}
                      </li>
                      <li>
                        <strong>Location:</strong>{" "}
                        {location.latitude && location.longitude
                          ? `${location.latitude.toFixed(
                              5
                            )}, ${location.longitude.toFixed(5)}`
                          : "Not set"}
                      </li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              <Card className="mb-4">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="ri-map-pin-line me-2"></i>
                    Select Car Location
                  </h5>
                  <LocationPicker
                    onLocationChange={({ latitude, longitude, address }) => {
                      setLocation({ latitude, longitude });
                      setFormData((prev) => ({
                        ...prev,
                        address: address || prev.address,
                        latitude,
                        longitude,
                      }));
                    }}
                  />
                  <div className="saved-address-info">
                    <strong>Saved Address:</strong>{" "}
                    {formData.address || "Not set"}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Submit Buttons */}
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        * Required fields must be filled out
                      </small>
                    </div>
                    <div>
                      <Button
                        type="button"
                        color="secondary"
                        className="me-2"
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        <i className="ri-save-line me-2"></i>
                        Add Car
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default AddNewCar;
