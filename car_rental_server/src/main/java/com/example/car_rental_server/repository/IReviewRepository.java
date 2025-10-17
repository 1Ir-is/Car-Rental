package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.Review;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.UUID;

@Repository
public interface IReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByVehicle_IdOrderByCreatedAtDesc(UUID vehicleId, Pageable pageable);
    List<Review> findByVehicle_IdOrderByCreatedAtDesc(UUID vehicleId);

    long countByVehicle_IdAndRating(UUID vehicleId, Integer rating);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.vehicle.id = :vehicleId")
    Double findAverageRatingByVehicleId(@Param("vehicleId") UUID vehicleId);

    long countByVehicle_Id(UUID vehicleId);
}