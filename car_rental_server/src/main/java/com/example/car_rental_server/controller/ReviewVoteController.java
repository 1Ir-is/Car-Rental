package com.example.car_rental_server.controller;

import com.example.car_rental_server.service.review.ReviewVoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints:
 *  POST /api/reviews/{reviewId}/vote  { "helpful": true }  -> toggles user's vote
 *  (returns { helpfulCount, notHelpfulCount, userVote })
 */
@RestController
@RequiredArgsConstructor
public class ReviewVoteController {

    private final ReviewVoteService reviewVoteService;

    public static class VoteRequest {
        private Boolean helpful;
        public Boolean getHelpful() { return helpful; }
        public void setHelpful(Boolean helpful) { this.helpful = helpful; }
    }

    public static class VoteResponse {
        public long helpfulCount;
        public long notHelpfulCount;
        public int userVote; // 1, -1, 0
    }

    @PostMapping("/api/reviews/{reviewId}/vote")
    public ResponseEntity<?> toggleVote(@PathVariable Long reviewId, @RequestBody VoteRequest req) {
        if (req == null || req.getHelpful() == null) {
            return ResponseEntity.badRequest().body("Missing 'helpful' boolean in body");
        }
        try {
            ReviewVoteService.VoteResult res = reviewVoteService.toggleVote(reviewId, req.getHelpful());
            VoteResponse vr = new VoteResponse();
            vr.helpfulCount = res.helpfulCount;
            vr.notHelpfulCount = res.notHelpfulCount;
            vr.userVote = res.userVote;
            return ResponseEntity.ok(vr);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body(ex.getMessage());
        }
    }
}