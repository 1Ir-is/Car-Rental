package com.example.car_rental_server.service.vehicle;

import com.example.car_rental_server.dto.PostVehicleDTO;

import java.util.List;
import java.util.Optional;

public interface IPostVehicleService {
    List<PostVehicleDTO> getAllVehicles();
    List<PostVehicleDTO> getVehiclesByOwner(Long userId);
    Optional<PostVehicleDTO> getVehicleById(Long id);
    PostVehicleDTO createVehicle(PostVehicleDTO dto);
    PostVehicleDTO updateVehicle(Long id, PostVehicleDTO dto);
    void deleteVehicle(Long id);
}