import React, { useEffect, useState } from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import { favoriteService } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "../../styles/car-item.css";

const CarItem = (props) => {
  const {
    imgUrl,
    imageList,
    model,
    carName,
    automatic,
    fuelType,
    price,
    id,
    ownerAvatar,
  } = props.item;

  const { user } = useAuth(); // Đúng key exported từ AuthContext
  const userId = user?.id;

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    setLoadingFav(true);
    favoriteService
      .isVehicleFollowed(id, userId)
      .then((fav) => {
        if (!cancelled) setIsFavorite(!!fav);
      })
      .finally(() => {
        if (!cancelled) setLoadingFav(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.info("Please login to use favorites");
      return;
    }
    setLoadingFav(true);
    try {
      if (isFavorite) {
        await favoriteService.unfollowVehicle(id, userId);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoriteService.followVehicle(id, userId);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Error while updating favorites.");
    }
    setLoadingFav(false);
  };

  const carImages =
    imageList && imageList.length > 0 ? imageList : imgUrl ? [imgUrl] : [];

  return (
    <Col lg="4" md="4" sm="6" className="mb-5">
      <div className="car__item">
        <div className="car__img">
          <div className="car__img-container">
            <img
              src={
                carImages[0] ||
                "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={carName}
              className="w-100"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x300?text=Image+Not+Found";
              }}
            />
            {ownerAvatar && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(30,42,73,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={ownerAvatar}
                  alt="Owner Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            {/* Favorite Heart Button */}
            <button
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              disabled={loadingFav}
              style={{ pointerEvents: loadingFav ? "none" : "auto" }}
            >
              <i className={`ri-heart-${isFavorite ? "fill" : "line"}`}></i>
              {/* Có thể thêm spinner nếu muốn */}
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
