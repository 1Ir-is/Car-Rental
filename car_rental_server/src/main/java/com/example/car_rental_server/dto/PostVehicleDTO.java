package com.example.car_rental_server.dto;

import com.example.car_rental_server.enums.VehicleStatus;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostVehicleDTO {
    private UUID id;
    private String vehicleName;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private String licensePlate;
    private Integer vehicleSeat;
    private String transmission;
    private String fuelType;
    private Double dailyPrice;
    private String description;
    private String category;
    private List<String> imageList;
    private List<String> features;
    private String address;
    private String placeId;
    private Double latitude;
    private Double longitude;
    private VehicleStatus status;
    private Boolean isRented;
    private Double rating;
    private Long userId;
    private String ownerName;
    private String ownerAvatar;
    private List<String> keepExistingImages;
}