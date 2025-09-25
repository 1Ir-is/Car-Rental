package com.example.car_rental_admin.model;

import com.example.car_rental_admin.enums.ApplicationType;
import com.example.car_rental_admin.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

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

    @Enumerated(EnumType.STRING)
    private ApplicationType type;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;
}