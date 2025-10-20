package com.example.car_rental_server.service.review;

import com.example.car_rental_server.model.Review;
import com.example.car_rental_server.model.ReviewVote;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IReplyRepository;
import com.example.car_rental_server.repository.IReviewRepository;
import com.example.car_rental_server.repository.IReviewVoteRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Simple service to toggle and query review votes (helpful/not helpful).
 *
 * Behavior:
 * - If user has no vote: create vote (helpful true/false).
 * - If user has same vote: remove vote (toggle off).
 * - If user has opposite vote: update vote to new value.
 *
 * Returns updated counts and the user's current vote state where needed.
 */
@Service
@RequiredArgsConstructor
public class ReviewVoteService implements IReviewVoteService {

    private final IReviewVoteRepository reviewVoteRepository;
    private final IReviewRepository reviewRepository;
    private final IUserRepository userRepository;

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        String principal = auth.getName();
        return userRepository.findByEmail(principal).orElseGet(() -> userRepository.findByName(principal).orElse(null));
    }

    @Override
    @Transactional
    public VoteResult toggleVote(Long reviewId, boolean helpful) {
        User current = resolveCurrentUser();
        if (current == null) {
            throw new RuntimeException("Authentication required"); // Controller should convert to 401
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        Optional<ReviewVote> maybe = reviewVoteRepository.findByReview_IdAndUser_Id(reviewId, current.getId());

        if (maybe.isPresent()) {
            ReviewVote existing = maybe.get();
            if (existing.getHelpful() == helpful) {
                // same vote -> remove (toggle off)
                reviewVoteRepository.delete(existing);
            } else {
                // change vote
                existing.setHelpful(helpful);
                reviewVoteRepository.save(existing);
            }
        } else {
            // create new
            ReviewVote v = ReviewVote.builder()
                    .helpful(helpful)
                    .review(review)
                    .user(current)
                    .build();
            reviewVoteRepository.save(v);
        }

        long helpfulCount = reviewVoteRepository.countByReview_IdAndHelpfulTrue(reviewId);
        long notHelpfulCount = reviewVoteRepository.countByReview_IdAndHelpfulFalse(reviewId);
        // find current user's vote state after update
        Optional<ReviewVote> after = reviewVoteRepository.findByReview_IdAndUser_Id(reviewId, current.getId());
        Integer userVote = 0;
        if (after.isPresent()) userVote = after.get().getHelpful() ? 1 : -1;

        return new VoteResult(helpfulCount, notHelpfulCount, userVote);
    }

    // small DTO result
    public static class VoteResult {
        public final long helpfulCount;
        public final long notHelpfulCount;
        public final int userVote; // 1 helpful, -1 not helpful, 0 none

        public VoteResult(long helpfulCount, long notHelpfulCount, int userVote) {
            this.helpfulCount = helpfulCount;
            this.notHelpfulCount = notHelpfulCount;
            this.userVote = userVote;
        }
    }
}