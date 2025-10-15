package com.example.car_rental_admin.service.vehicle;

import com.example.car_rental_admin.model.PostVehicle;
import org.springframework.data.domain.Page;

import java.util.Optional;
import java.util.UUID;

public interface IPostVehicleAdminService {
    Page<PostVehicle> searchVehicles(String query, String brand, String status, int page, int size);
    Optional<PostVehicle> findVehicleById(UUID id);
    long countTotalVehicles();
    long countVehiclesByStatus(String status);
}