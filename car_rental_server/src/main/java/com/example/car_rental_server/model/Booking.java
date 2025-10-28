package com.example.car_rental_server.model;

import com.example.car_rental_server.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user; // Khách thuê

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner; // Chủ xe

    @ManyToOne(fetch = FetchType.LAZY)
    private PostVehicle vehicle;

    private LocalDate startDate;
    private LocalDate endDate;

    private String pickupLocation;
    private String dropoffLocation;
    private LocalDateTime bookingDate;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String note; // user ghi chú
}