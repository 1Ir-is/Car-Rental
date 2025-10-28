package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IBookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findAll(); // Lấy tất cả bookings
    // Có thể thêm các query khác nếu cần filter theo trạng thái, owner, user...
}
