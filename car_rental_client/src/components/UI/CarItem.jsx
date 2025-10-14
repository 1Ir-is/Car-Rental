import React, { useState } from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import CarImageGallery from "./CarImageGallery";
import "../../styles/car-item.css";

const CarItem = (props) => {
  const { imgUrl, imageList, model, carName, automatic, fuelType, price, id } =
    props.item;

  const [isFavorite, setIsFavorite] = useState(false);

  const carImages =
    imageList && imageList.length > 0 ? imageList : imgUrl ? [imgUrl] : [];

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Add API call to save/remove from favorites
    console.log(
      `${isFavorite ? "Removed from" : "Added to"} favorites:`,
      carName
    );
  };

  return (
    <Col lg="4" md="4" sm="6" className="mb-5">
      <div className="car__item">
        <div className="car__img">
          <div className="car__img-container">
            {carImages.length > 0 ? (
              <CarImageGallery images={carImages} carName={carName} />
            ) : (
              <img
                src="https://via.placeholder.com/400x300?text=No+Image"
                alt={carName}
                className="w-100"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
            )}

            {/* Favorite Heart Button */}
            <button
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <i className={`ri-heart-${isFavorite ? "fill" : "line"}`}></i>
            </button>
          </div>
        </div>

        <div className="car__item-content mt-4">
          <h4 className="section__title text-center">{carName}</h4>
          <h6 className="rent__price text-center mt-">
            ${price}.00 <span>/ Day</span>
          </h6>

          <div className="car__item-info d-flex align-items-center justify-content-between mt-3 mb-4">
            <span className="d-flex align-items-center gap-1">
              <i className="ri-car-line"></i> {model}
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="ri-settings-2-line"></i> {automatic}
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="ri-gas-station-line"></i> {fuelType}
            </span>
          </div>

          <div className="car__item-buttons d-flex">
            <Link
              to={`/cars/${id}`}
              className="car__item-btn car__btn-rent w-50"
            >
              Rent
            </Link>

            <Link
              to={`/cars/${id}`}
              className="car__item-btn car__btn-details w-50"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default CarItem;
