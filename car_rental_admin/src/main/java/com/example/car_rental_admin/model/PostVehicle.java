package com.example.car_rental_admin.model;


import com.example.car_rental_admin.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "post_vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostVehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Basic Information
    private String vehicleName;     // Car Name
    private String brand;           // Brand (Toyota, BMW, ...)
    private String model;           // Model (Camry, X5, ...)
    private Integer year;           // Year
    private String color;           // Color
    private String licensePlate;    // License Plate
    private Integer vehicleSeat;    // Number of seats
    private String transmission;    // Transmission (Automatic, Manual)
    private String fuelType;        // Fuel Type (Petrol, Diesel, Electric, Hybrid)
    private Double dailyPrice;      // Daily Price (USD)
    private String description;     // Description
    private String category;        // Category (Sedan, SUV, ...)

    // Images (max 5)
    @ElementCollection
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    private List<String> imageList; // List of image URLs

    // Features & Amenities
    @ElementCollection
    @CollectionTable(name = "vehicle_features", joinColumns = @JoinColumn(name = "vehicle_id"))
    private List<String> features;  // List of feature names

    // Location
    private String address;         // Address (optional)
    private String placeId;         // Google Place ID
    private Double latitude;
    private Double longitude;

    // Status & Rental Info
    @Enumerated(EnumType.STRING)
    private VehicleStatus status;
    private String rejectionReason;
    private String unavailableReason;
    private Boolean isRented;       // Is rented
    private Double rating;          // User rating

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}