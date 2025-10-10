package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.PostVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostVehicleRepository extends JpaRepository<PostVehicle, Long> {
    List<PostVehicle> findByUser_Id(Long userId);
}