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
    private Long ownerId; // Đổi tên cho rõ ràng
    private String ownerName;
    private String ownerAvatar;
    private List<String> keepExistingImages;

    public static PostVehicleDTO from(com.example.car_rental_server.model.PostVehicle vehicle) {
        if (vehicle == null) return null;
        return PostVehicleDTO.builder()
                .id(vehicle.getId())
                .vehicleName(vehicle.getVehicleName())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .licensePlate(vehicle.getLicensePlate())
                .vehicleSeat(vehicle.getVehicleSeat())
                .transmission(vehicle.getTransmission())
                .fuelType(vehicle.getFuelType())
                .dailyPrice(vehicle.getDailyPrice())
                .description(vehicle.getDescription())
                .category(vehicle.getCategory())
                .imageList(vehicle.getImageList())
                .features(vehicle.getFeatures())
                .address(vehicle.getAddress())
                .placeId(vehicle.getPlaceId())
                .latitude(vehicle.getLatitude())
                .longitude(vehicle.getLongitude())
                .status(vehicle.getStatus())
                .isRented(vehicle.getIsRented())
                .rating(vehicle.getRating())
                .ownerId(vehicle.getOwner() != null ? vehicle.getOwner().getId() : null)
                .ownerName(vehicle.getOwnerName())
                .ownerAvatar(vehicle.getOwnerAvatar())
                .build();
    }
}