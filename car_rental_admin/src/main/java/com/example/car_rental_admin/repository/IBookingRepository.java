package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IBookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findAll(); // Lấy tất cả bookings
    long countByStartDate(LocalDate startDate);
}
