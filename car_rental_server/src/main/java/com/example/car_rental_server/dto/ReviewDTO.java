package com.example.car_rental_server.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
    // new: avatar URL
    private String avatar;
    private UUID vehicleId;
}