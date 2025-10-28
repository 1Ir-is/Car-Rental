package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.PostVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPostVehicleRepository extends JpaRepository<PostVehicle, UUID> {
    // Tìm tất cả xe của owner (thống kê dashboard)
    List<PostVehicle> findAllByOwner_Id(Long ownerId);

    // Tìm tất cả xe của owner (tên khác, giữ lại nếu cần cho code cũ)
    List<PostVehicle> findByOwner_Id(Long ownerId);

    @Query("SELECT v FROM PostVehicle v JOIN FETCH v.owner WHERE v.id = :id")
    Optional<PostVehicle> findByIdWithOwner(UUID id);
}