package com.example.car_rental_server.model;

import com.example.car_rental_server.enums.ApplicationType;
import com.example.car_rental_server.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "approval_applications")
public class ApprovalApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String name;
    private String phone;
    private String email;
    private String address;
    private String identity;
    private String title;
    private String description;
    @Column(name = "applied_date")
    private LocalDateTime appliedDate;

    @Enumerated(EnumType.STRING)
    private ApplicationType type;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;
}