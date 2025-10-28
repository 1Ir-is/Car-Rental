package com.example.car_rental_server.service.owner;

import com.example.car_rental_server.dto.PostVehicleDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IPostVehicleService {
    List<PostVehicleDTO> getAllVehicles();
    List<PostVehicleDTO> getVehiclesByOwner(Long userId);
    Optional<PostVehicleDTO> getVehicleById(UUID id);
    PostVehicleDTO createVehicle(PostVehicleDTO dto);
    PostVehicleDTO updateVehicle(UUID id, PostVehicleDTO dto);
    void deleteVehicle(UUID id);
    double getAverageRatingForOwner(Long ownerId);
    int getTotalReviewsForOwner(Long ownerId);
}