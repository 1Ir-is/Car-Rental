package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.PostVehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IPostVehicleRepository extends JpaRepository<PostVehicle, UUID> {
    // Search by name, license plate, brand
    Page<PostVehicle> findByVehicleNameContainingIgnoreCaseOrLicensePlateContainingIgnoreCaseOrBrandContainingIgnoreCase(
            String name, String licensePlate, String brand, Pageable pageable);

    // Filter by brand & status (optional)
    Page<PostVehicle> findByBrandIgnoreCaseAndStatusIgnoreCase(String brand, String status, Pageable pageable);

    long countByStatusIgnoreCase(String status);
}