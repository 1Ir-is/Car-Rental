package com.example.car_rental_server.service.review;

public interface IReviewVoteService {
    ReviewVoteService.VoteResult toggleVote(Long reviewId, boolean helpful);
    
}
