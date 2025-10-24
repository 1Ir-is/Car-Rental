package com.example.car_rental_server.service.follow_vehicle;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.model.PostVehicle;

import java.util.List;
import java.util.UUID;

public interface IFollowVehicleService {
    boolean followVehicle(Long userId, UUID vehicleId);
    boolean unfollowVehicle(Long userId, UUID vehicleId);
    boolean isFollowing(Long userId, UUID vehicleId);
    long countFollowers(UUID vehicleId);
    List<PostVehicle> getFollowedVehicles(Long userId);
    List<PostVehicleDTO> getFollowedVehicleDTOs(Long userId);
}