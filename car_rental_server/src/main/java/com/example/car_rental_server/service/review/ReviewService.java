package com.example.car_rental_server.service.review;

import com.example.car_rental_server.dto.ReviewDTO;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.Review;
import com.example.car_rental_server.model.ReviewVote;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IReviewRepository;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IReviewVoteRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService implements IReviewService {

    private final IReviewRepository reviewRepository;
    private final IPostVehicleRepository postVehicleRepository;
    private final IUserRepository userRepository; // used to resolve current user by email
    private final IReviewVoteRepository reviewVoteRepository;

    // (only showing the toDTO method replacement; keep rest of the file as you have it)
    private ReviewDTO toDTO(Review r) {
        if (r == null) return null;
        ReviewDTO dto = ReviewDTO.builder()
                .id(r.getId())
                .rating(r.getRating())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .vehicleId(r.getVehicle() != null ? r.getVehicle().getId() : null)
                .build();
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setUserName(r.getUser().getName());
            dto.setAvatar(r.getUser().getAvatar());
        }

        // counts
        long helpful = reviewVoteRepository.countByReview_IdAndHelpfulTrue(r.getId());
        long notHelpful = reviewVoteRepository.countByReview_IdAndHelpfulFalse(r.getId());
        dto.setHelpfulCount(helpful);
        dto.setNotHelpfulCount(notHelpful);

        // user vote
        int userVote = 0;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String principal = auth.getName();
            Optional<User> u = userRepository.findByEmail(principal);
            if (u.isEmpty()) u = userRepository.findByName(principal);
            if (u.isPresent()) {
                Optional<ReviewVote> rv = reviewVoteRepository.findByReview_IdAndUser_Id(r.getId(), u.get().getId());
                if (rv.isPresent()) userVote = rv.get().getHelpful() ? 1 : -1;
            }
        }
        dto.setUserVote(userVote);
        return dto;
    }

    // Convert DTO -> entity (partial). Caller must set vehicle/user entities.
    private Review toEntity(ReviewDTO dto) {
        if (dto == null) return null;
        return Review.builder()
                .rating(dto.getRating())
                .content(dto.getContent())
                .createdAt(dto.getCreatedAt() == null ? LocalDateTime.now() : dto.getCreatedAt())
                .build();
    }

    /**
     * Create a review for a vehicle.
     * dto.vehicleId must be provided. If client does not provide userId, the authenticated user will be used.
     */
    @Override
    @Transactional
    public ReviewDTO createReview(ReviewDTO dto) {
        if (dto == null) throw new IllegalArgumentException("Review data is required");
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (dto.getVehicleId() == null) {
            throw new IllegalArgumentException("vehicleId is required");
        }

        // Load vehicle
        UUID vehicleId = dto.getVehicleId();
        PostVehicle vehicle = postVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));

        // Build entity
        Review r = toEntity(dto);
        r.setVehicle(vehicle);

        // 1) If client provided userId, try to set that user (backwards compatibility)
        if (dto.getUserId() != null) {
            Optional<User> uOpt = userRepository.findById(dto.getUserId());
            uOpt.ifPresent(r::setUser);
        }

        // 2) If still no user set, try to get currently authenticated user from SecurityContext
        if (r.getUser() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
                String principalName = auth.getName(); // typically email or username depending on your JWT subject
                try {
                    // userRepository should provide a finder by email. If your repo method name differs, adapt accordingly.
                    Optional<User> curUser = userRepository.findByEmail(principalName);
                    if (curUser.isPresent()) {
                        r.setUser(curUser.get());
                    } else {
                        // fallback: try lookup by username if different
                        Optional<User> byUsername = userRepository.findByName(principalName);
                        byUsername.ifPresent(r::setUser);
                    }
                } catch (Exception ex) {
                    // ignore lookup failure; we still save review without user if not found
                    System.err.println("Failed to resolve current user for review: " + ex.getMessage());
                }
            }
        }

        Review saved = reviewRepository.save(r);

        // Recalculate average rating and update vehicle.rating (best-effort)
        try {
            Double avg = reviewRepository.findAverageRatingByVehicleId(vehicleId);
            long total = reviewRepository.countByVehicle_Id(vehicleId);
            vehicle.setRating(avg != null ? avg : 0.0);
            postVehicleRepository.save(vehicle);
        } catch (Exception ex) {
            // Log to stderr to avoid breaking creation flow
            System.err.println("Failed to update vehicle rating: " + ex.getMessage());
        }

        return toDTO(saved);
    }

    @Override
    public Page<ReviewDTO> getReviewsForVehicle(UUID vehicleId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> pageEnt = reviewRepository.findByVehicle_IdOrderByCreatedAtDesc(vehicleId, pageable);
        return pageEnt.map(this::toDTO);
    }

    @Override
    public List<ReviewDTO> getAllReviewsForVehicle(UUID vehicleId) {
        List<Review> list = reviewRepository.findByVehicle_IdOrderByCreatedAtDesc(vehicleId);
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public double getAverageRating(UUID vehicleId) {
        Double avg = reviewRepository.findAverageRatingByVehicleId(vehicleId);
        return avg != null ? avg : 0.0;
    }

    @Override
    public long countReviews(UUID vehicleId) {
        return reviewRepository.countByVehicle_Id(vehicleId);
    }

    @Override
    public long countByStar(UUID vehicleId, int star) {
        return reviewRepository.countByVehicle_IdAndRating(vehicleId, Integer.valueOf(star));
    }
}