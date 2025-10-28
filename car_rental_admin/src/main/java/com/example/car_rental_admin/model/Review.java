package com.example.car_rental_admin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // rating 1..5
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "text")
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Who wrote the review (user) - liên kết nếu bạn có entity User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore // tránh vòng lặp / thông tin nhạy cảm khi serialize
    private User user;

    // Which vehicle (post_vehicle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore // tránh vòng lặp khi serialize vehicle -> reviews -> vehicle...
    private PostVehicle vehicle;
}