import React, { useState } from "react";
import "../../styles/car-image-gallery.css";

const CarImageGallery = ({ images, carName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="car-image-gallery">
        <div className="main-image">
          <img
            src="https://via.placeholder.com/400x300?text=No+Image"
            alt={carName || "Car"}
            className="img-fluid"
          />
        </div>
      </div>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div
      className={`car-image-gallery ${
        images.length > 1 ? "has-thumbnails" : ""
      }`}
    >
      <div className="main-image-container">
        <div className="main-image">
          <img
            src={images[currentImageIndex]}
            alt={`${carName || "Car"} - ${currentImageIndex + 1}`}
            className="img-fluid"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=Image+Not+Found";
            }}
          />

          {images.length > 1 && (
            <>
              <button
                className="nav-arrow nav-arrow-left"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>

              <button
                className="nav-arrow nav-arrow-right"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="thumbnail-container">
          <div className="thumbnails">
            {images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${
                  index === currentImageIndex ? "active" : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${carName || "Car"} thumbnail ${index + 1}`}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/90x70?text=Thumb";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
