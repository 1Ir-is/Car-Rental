package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.ReviewDTO;
import com.example.car_rental_server.service.review.IReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final IReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(@PathVariable UUID vehicleId, @RequestBody ReviewDTO dto) {
        // trust server side to set dto.vehicleId and dto.userId from auth in real app
        dto.setVehicleId(vehicleId);
        ReviewDTO created = reviewService.createReview(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getReviews(@PathVariable UUID vehicleId,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDTO> p = reviewService.getReviewsForVehicle(vehicleId, page, size);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@PathVariable UUID vehicleId) {
        double avg = reviewService.getAverageRating(vehicleId);
        long total = reviewService.countReviews(vehicleId);
        long star5 = reviewService.countByStar(vehicleId, 5);
        long star4 = reviewService.countByStar(vehicleId, 4);
        long star3 = reviewService.countByStar(vehicleId, 3);
        long star2 = reviewService.countByStar(vehicleId, 2);
        long star1 = reviewService.countByStar(vehicleId, 1);
        return ResponseEntity.ok(new Object() {
            public final double average = avg;
            public final long count = total;
            public final long s5 = star5;
            public final long s4 = star4;
            public final long s3 = star3;
            public final long s2 = star2;
            public final long s1 = star1;
        });
    }
}