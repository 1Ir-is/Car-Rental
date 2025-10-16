package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.PostVehicle;
import com.example.car_rental_admin.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IPostVehicleRepository extends JpaRepository<PostVehicle, UUID> {
    // Tìm kiếm không liên quan đến status (String)
    Page<PostVehicle> findByVehicleNameContainingIgnoreCaseOrLicensePlateContainingIgnoreCaseOrBrandContainingIgnoreCase(
            String name, String licensePlate, String brand, Pageable pageable);

    // Tìm theo brand và status (brand là String, status là Enum)
    Page<PostVehicle> findByBrandIgnoreCaseAndStatus(String brand, VehicleStatus status, Pageable pageable);

    // Đếm theo status (Enum)
    long countByStatus(VehicleStatus status);
}