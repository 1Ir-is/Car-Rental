package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.ReviewVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IReviewVoteRepository extends JpaRepository<ReviewVote, Long> {

    long countByReview_IdAndHelpfulTrue(Long reviewId);

    long countByReview_IdAndHelpfulFalse(Long reviewId);

    Optional<ReviewVote> findByReview_IdAndUser_Id(Long reviewId, Long userId);

    // optional helper to delete by review/user
    void deleteByReview_IdAndUser_Id(Long reviewId, Long userId);
}