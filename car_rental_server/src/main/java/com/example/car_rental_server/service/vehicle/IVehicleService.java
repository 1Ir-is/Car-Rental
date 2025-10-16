package com.example.car_rental_server.service.vehicle;

import com.example.car_rental_server.dto.PostVehicleDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IVehicleService {
    List<PostVehicleDTO> getAllVehicles();
    Optional<PostVehicleDTO> getVehicleById(UUID id);
}