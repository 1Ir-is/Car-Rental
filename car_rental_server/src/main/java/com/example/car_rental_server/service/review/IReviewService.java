package com.example.car_rental_server.service.review;

import com.example.car_rental_server.dto.ReviewDTO;
import com.example.car_rental_server.model.Review;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface IReviewService {
    ReviewDTO createReview(ReviewDTO dto);
    Page<ReviewDTO> getReviewsForVehicle(UUID vehicleId, int page, int size);
    List<ReviewDTO> getAllReviewsForVehicle(UUID vehicleId);
    double getAverageRating(UUID vehicleId);
    long countReviews(UUID vehicleId);
    long countByStar(UUID vehicleId, int star);
}