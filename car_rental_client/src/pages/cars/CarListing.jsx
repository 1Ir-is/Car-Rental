import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Helmet from "../../components/Helmet/Helmet";
import CommonSection from "../../components/UI/CommonSection";
import CarItem from "../../components/UI/CarItem";
import { vehicleService } from "../../services/vehicleService";

const CarListing = () => {
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(""); // "low" or "high"

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const res = await vehicleService.getAllVehicles();
      if (res.success && Array.isArray(res.data)) {
        // Filter only available vehicles for customers
        const availableVehicles = res.data.filter(
          (vehicle) =>
            vehicle.status && vehicle.status.toLowerCase() === "available"
        );
        setCarData(availableVehicles);
      } else {
        setCarData([]);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, []);

  const sortedCarData = React.useMemo(() => {
    if (!sortOrder) return carData;
    const carsCopy = [...carData];
    if (sortOrder === "low") {
      carsCopy.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortOrder === "high") {
      carsCopy.sort((a, b) => b.dailyPrice - a.dailyPrice);
    }
    return carsCopy;
  }, [carData, sortOrder]);

  return (
    <Helmet title="Cars">
      <CommonSection title="Car Listing" />

      <section>
        <Container>
          <Row>
            <Col lg="12">
              <div className=" d-flex align-items-center gap-3 mb-5">
                <span className=" d-flex align-items-center gap-2">
                  <i className="ri-sort-asc"></i> Sort By
                </span>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="low">Low to High</option>
                  <option value="high">High to Low</option>
                </select>
              </div>
            </Col>

            {loading ? (
              <div className="w-100 text-center">Loading car list...</div>
            ) : sortedCarData.length === 0 ? (
              <div className="w-100 text-center">No cars available.</div>
            ) : (
              sortedCarData.map((car) => (
                <CarItem
                  key={car.id}
                  item={{
                    id: car.id,
                    imgUrl: car.imageList?.[0] || "/default_car_image.png",
                    imageList: car.imageList,
                    model: car.model,
                    carName: car.vehicleName,
                    automatic: car.transmission,
                    fuelType: car.fuelType,
                    price: car.dailyPrice,
                    ownerAvatar: car.ownerAvatar,
                  }}
                />
              ))
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default CarListing;
