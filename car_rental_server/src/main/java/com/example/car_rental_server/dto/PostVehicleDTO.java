package com.example.car_rental_server.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostVehicleDTO {
    private Long id;
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
    private String status;
    private Boolean isRented;
    private Double rating;
    private Long userId;
}