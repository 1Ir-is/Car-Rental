package com.example.car_rental_server.service.reply;

import com.example.car_rental_server.dto.ReplyDTO;

import java.util.List;

public interface IReplyService {
    ReplyDTO createReply(Long reviewId, Long parentId, String content);
    List<ReplyDTO> getRepliesTreeForReview(Long reviewId);
}
