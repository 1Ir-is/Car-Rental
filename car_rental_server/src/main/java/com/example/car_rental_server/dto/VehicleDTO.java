package com.example.car_rental_server.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VehicleDTO {
    private Long id;
    private String carName;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private String licensePlate;
    private Integer seats;
    private String transmission;
    private String fuelType;
    private String description;
    private String title;
    private BigDecimal dailyPrice;
    private String status;
    private Double rating;
    private Boolean isRented;
    private String address;
//    private Double latitude;
//    private Double longitude;
    private List<String> features;
    private Long ownerId;
    private List<VehicleImageDTO> images;
}