package com.example.car_rental_server.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
    private String avatar;
    private Long parentId; // null if top-level

    // If this reply was created in response to a specific comment, keep that info
    private Long replyToId;
    private String replyToUserName;
    private String replyToAvatar; // NEW: avatar URL of the replied-to user

    // IMPORTANT: ensure children is always non-null
    @Builder.Default
    private List<ReplyDTO> children = new ArrayList<>();
}