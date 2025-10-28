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
    status,
  } = props.item;

  const { user } = useAuth();
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

  const isRented = status && status.toLowerCase() === "rented";

  return (
    <Col lg="4" md="4" sm="6" className="mb-5">
      <div
        className="car__item"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="car__img"
          style={{
            position: "relative",
          }}
        >
          <div className="car__img-container" style={{ position: "relative" }}>
            <img
              src={
                carImages[0] ||
                "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={carName}
              className="w-100"
              style={{
                filter: isRented
                  ? "blur(3px) grayscale(0.4) brightness(0.90)"
                  : "none",
                transition: "filter 0.2s",
              }}
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
                  zIndex: 2,
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

            {/* Rented badge: center overlay */}
            {isRented && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background:
                    "linear-gradient(90deg, #ef4444 0%, #f87171 100%)",
                  color: "#fff",
                  borderRadius: 18,
                  padding: "22px 54px",
                  fontWeight: 900,
                  fontSize: 38,
                  zIndex: 10,
                  boxShadow:
                    "0 8px 32px rgba(239,68,68,0.18), 0 2px 12px rgba(30,42,73,.18)",
                  letterSpacing: 3,
                  textShadow: "0 4px 16px rgba(30,42,73,.18), 0 1px 0 #fff",
                  pointerEvents: "none",
                  userSelect: "none",
                  border: "3px solid #fff",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  RENTED
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                    borderRadius: 18,
                    animation: "shine 2.2s linear infinite",
                  }}
                ></span>
                <style>{`
                  @keyframes shine {
                    0% { opacity: 0.7; }
                    50% { opacity: 1; }
                    100% { opacity: 0.7; }
                  }
                `}</style>
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
              style={{
                pointerEvents: loadingFav ? "none" : "auto",
                zIndex: 12,
                position: "absolute",
                top: 16,
                right: 16,
              }}
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
              to="#"
              className="car__item-btn car__btn-rent w-50"
              style={{
                background: isRented ? "#e5e7eb" : "",
                color: isRented ? "#888" : "",
                cursor: isRented ? "not-allowed" : "pointer",
                pointerEvents: isRented ? "none" : "auto",
                fontWeight: 700,
              }}
              tabIndex={isRented ? -1 : 0}
              aria-disabled={isRented}
            >
              Rent
            </Link>
            <Link
              to={isRented ? "#" : `/cars/${id}`}
              className="car__item-btn car__btn-details w-50"
              style={{
                background: isRented ? "#e5e7eb" : "",
                color: isRented ? "#888" : "",
                cursor: isRented ? "not-allowed" : "pointer",
                pointerEvents: isRented ? "none" : "auto",
                fontWeight: 700,
              }}
              tabIndex={isRented ? -1 : 0}
              aria-disabled={isRented}
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
