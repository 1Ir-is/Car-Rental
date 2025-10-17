package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.ReplyDTO;

import com.example.car_rental_server.service.reply.IReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReplyController {

    private final IReplyService replyService;

    // GET nested replies for a review
    @GetMapping("/api/reviews/{reviewId}/replies")
    public ResponseEntity<List<ReplyDTO>> getReplies(@PathVariable Long reviewId) {
        List<ReplyDTO> tree = replyService.getRepliesTreeForReview(reviewId);
        return ResponseEntity.ok(tree);
    }

    // POST create reply to review (optional parentId)
    @PostMapping("/api/reviews/{reviewId}/replies")
    public ResponseEntity<ReplyDTO> createReply(@PathVariable Long reviewId, @RequestBody CreateReplyRequest req) {
        ReplyDTO created = replyService.createReply(reviewId, req.getParentId(), req.getContent());
        return ResponseEntity.ok(created);
    }

    // request body
    public static class CreateReplyRequest {
        private Long parentId;
        private String content;
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}