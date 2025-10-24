package com.example.car_rental_server.service.follow_vehicle;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.model.FollowVehicle;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IFollowVehicleRepository;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowVehicleService implements IFollowVehicleService {

    private final IFollowVehicleRepository followRepo;
    private final IPostVehicleRepository vehicleRepo;
    private final IUserRepository userRepo;

    @Override
    @Transactional
    public boolean followVehicle(Long userId, UUID vehicleId) {
        Optional<User> userOpt = userRepo.findById(userId);
        Optional<PostVehicle> vehicleOpt = vehicleRepo.findById(vehicleId);
        if (userOpt.isEmpty() || vehicleOpt.isEmpty()) return false;

        User user = userOpt.get();
        PostVehicle vehicle = vehicleOpt.get();

        if (followRepo.existsByUserAndVehicle(user, vehicle)) {
            return false; // đã follow rồi
        }
        FollowVehicle follow = FollowVehicle.builder()
                .user(user)
                .vehicle(vehicle)
                .followedAt(LocalDateTime.now())
                .build();
        followRepo.save(follow);
        return true;
    }

    @Override
    @Transactional
    public boolean unfollowVehicle(Long userId, UUID vehicleId) {
        Optional<User> userOpt = userRepo.findById(userId);
        Optional<PostVehicle> vehicleOpt = vehicleRepo.findById(vehicleId);
        if (userOpt.isEmpty() || vehicleOpt.isEmpty()) return false;

        User user = userOpt.get();
        PostVehicle vehicle = vehicleOpt.get();

        if (followRepo.existsByUserAndVehicle(user, vehicle)) {
            followRepo.deleteByUserAndVehicle(user, vehicle);
            return true;
        }
        return false;
    }

    @Override
    public boolean isFollowing(Long userId, UUID vehicleId) {
        Optional<User> userOpt = userRepo.findById(userId);
        Optional<PostVehicle> vehicleOpt = vehicleRepo.findById(vehicleId);
        if (userOpt.isEmpty() || vehicleOpt.isEmpty()) return false;

        return followRepo.existsByUserAndVehicle(userOpt.get(), vehicleOpt.get());
    }

    @Override
    public long countFollowers(UUID vehicleId) {
        Optional<PostVehicle> vehicleOpt = vehicleRepo.findById(vehicleId);
        if (vehicleOpt.isEmpty()) return 0;
        return followRepo.countByVehicle(vehicleOpt.get());
    }

    @Override
    public List<PostVehicle> getFollowedVehicles(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        List<FollowVehicle> follows = followRepo.findAllByUser(userOpt.get());
        return follows.stream().map(FollowVehicle::getVehicle).collect(Collectors.toList());
    }

    @Override
    public List<PostVehicleDTO> getFollowedVehicleDTOs(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        List<FollowVehicle> follows = followRepo.findAllByUser(userOpt.get());
        return follows.stream()
                .map(FollowVehicle::getVehicle)
                .map(PostVehicleDTO::from)
                .collect(Collectors.toList());
    }
}
