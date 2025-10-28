package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.Booking;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IBookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findAllByUser(User user);
    List<Booking> findAllByOwner(User owner);
    List<Booking> findAllByVehicle(PostVehicle vehicle);
}