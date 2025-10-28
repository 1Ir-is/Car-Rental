package com.example.car_rental_server.dto;

import com.example.car_rental_server.enums.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private UUID id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long ownerId;
    private String ownerName;
    private String ownerAvatar;
    private UUID vehicleId;
    private String vehicleName;
    private List<String> vehicleImages;
    private LocalDate startDate;
    private LocalDate endDate;
    private String pickupLocation;
    private String dropoffLocation;
    private LocalDateTime bookingDate;
    private Double totalAmount;
    private Double vehicleDailyPrice;
    private BookingStatus status;
    private String note;
}