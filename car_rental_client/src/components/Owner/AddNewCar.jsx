import React, { useState, useRef } from "react";
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
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import "leaflet/dist/leaflet.css";

// Google Maps API Key
const GOOGLE_MAPS_KEY = "AIzaSyDWTx7bREpM5B6JKdbzOvMW-RRlhkukmVE";

// Google Maps Picker Component
function GoogleLocationPicker({ onLocationChange }) {
  const [center, setCenter] = useState({ lat: 16.0544, lng: 108.2022 });
  const [marker, setMarker] = useState(center);
  const [placeId, setPlaceId] = useState("");
  const autocompleteRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: ["places"],
  });

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCenter({ lat, lng });
      setMarker({ lat, lng });
      setPlaceId(place.place_id);
      onLocationChange({
        latitude: lat,
        longitude: lng,
        placeId: place.place_id,
        address: place.formatted_address,
      });
    }
  };

  return isLoaded ? (
    <div>
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Nhập địa chỉ hoặc địa điểm"
          style={{
            width: "100%",
            height: "38px",
            marginBottom: "8px",
            padding: "6px",
          }}
        />
      </Autocomplete>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100%", height: "300px" }}
        onClick={(e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setMarker({ lat, lng });
          setCenter({ lat, lng });
          // Optional: Reverse geocode để lấy place_id từ lat/lng nếu muốn
        }}
      >
        <Marker position={marker} />
      </GoogleMap>
      {placeId && (
        <div style={{ margin: "8px 0", fontSize: "13px" }}>
          <b>Google Place ID:</b> {placeId}
        </div>
      )}
    </div>
  ) : (
    <div>Loading map...</div>
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
  const [showSuccess, setShowSuccess] = useState(false);

  // For map location
  const [location, setLocation] = useState({
    latitude: 16.0544, // Default Da Nang
    longitude: 108.2022,
  });

  // Available options
  const brandOptions = [
    "Toyota",
    "Honda",
    "BMW",
    "Mercedes",
    "Audi",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Hyundai",
    "Kia",
  ];
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

  // Callback cho GoogleLocationPicker
  const handleGoogleLocationChange = ({
    latitude,
    longitude,
    placeId,
    address,
  }) => {
    setLocation({ latitude, longitude });
    setFormData((prev) => ({
      ...prev,
      placeId: placeId || "",
      address: address || prev.address,
    }));
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
      placeId: formData.placeId, // Thêm placeId vào DTO
    };

    const imageFiles = images.map((img) => img.file);

    try {
      const response = await vehicleService.createVehicle(
        vehicleDTO,
        imageFiles
      );
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
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
          setShowSuccess(false);
          setLocation({ latitude: 16.0544, longitude: 108.2022 });
        }, 3000);
      } else {
        setErrors({
          submit: response.message || "Failed to add car. Please try again.",
        });
      }
    } catch (error) {
      setErrors({ submit: "Failed to add car. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-new-car">
      <div className="section-header mb-4">
        <h4>Add New Car</h4>
        <p className="text-muted">Add a new vehicle to your rental fleet</p>
      </div>

      {showSuccess && (
        <Alert color="success" className="mb-4">
          <i className="ri-check-circle-line me-2"></i>
          Car added successfully! Redirecting to car list...
        </Alert>
      )}

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
                      <Label for="name">Car Name *</Label>
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
                      <Label for="brand">Brand *</Label>
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
                      <Label for="model">Model *</Label>
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
                      <Label for="year">Year *</Label>
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
                      <Label for="color">Color *</Label>
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
                      <Label for="licensePlate">License Plate *</Label>
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
                      <Label for="price">Daily Price (USD) *</Label>
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
                  <Label for="description">Description *</Label>
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
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="address">Address</Label>
                  <Input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="Enter address (street, city...)"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
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
                        <Label check for={`feature-${index}`} className="ms-2">
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
                  Car Images *
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
                              className="btn btn-danger btn-sm remove-image-btn"
                              onClick={() => removeImage(image.id)}
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

            {/* Google Maps chọn vị trí và lấy placeId */}
            <Card className="mb-4">
              <CardBody>
                <h5 className="card-title mb-3">
                  <i className="ri-map-pin-line me-2"></i>
                  Select Car Location (Google Maps + Place ID)
                </h5>
                <GoogleLocationPicker
                  onLocationChange={handleGoogleLocationChange}
                />
                <small className="text-muted">
                  Nhập địa chỉ phía trên hoặc chọn vị trí trên bản đồ. Hệ thống
                  sẽ tự động lấy Place ID Google cho bạn!
                </small>
                {formData.placeId && (
                  <div style={{ margin: "8px 0", fontSize: "13px" }}>
                    <b>Google Place ID lưu vào hệ thống:</b> {formData.placeId}
                  </div>
                )}
                {/* Hiển thị bản đồ Google Maps Embed */}
                {formData.placeId && (
                  <div style={{ width: "100%", margin: "12px 0" }}>
                    <iframe
                      title="Google Maps Location"
                      className="thumbnail-img"
                      style={{ border: "0", width: "100%" }}
                      height="220"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=place_id:${formData.placeId}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
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
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Adding Car...
                        </>
                      ) : (
                        <>
                          <i className="ri-save-line me-2"></i>
                          Add Car
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddNewCar;
