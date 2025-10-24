package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.FollowVehicle;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IFollowVehicleRepository extends JpaRepository<FollowVehicle, UUID> {
    Optional<FollowVehicle> findByUserAndVehicle(User user, PostVehicle vehicle);
    List<FollowVehicle> findAllByUser(User user);
    List<FollowVehicle> findAllByVehicle(PostVehicle vehicle);
    long countByVehicle(PostVehicle vehicle);
    boolean existsByUserAndVehicle(User user, PostVehicle vehicle);
    void deleteByUserAndVehicle(User user, PostVehicle vehicle);
}