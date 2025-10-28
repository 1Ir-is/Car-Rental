package com.example.car_rental_server.service.booking;

import com.example.car_rental_server.dto.BookingDTO;

import java.util.List;
import java.util.UUID;

public interface IBookingService {
    BookingDTO createBooking(BookingDTO dto); // User đặt xe
    List<BookingDTO> getMyBookings(Long userId); // Lịch sử đặt xe của user
    List<BookingDTO> getOwnerBookings(Long ownerId); // Chủ xe xem booking
    BookingDTO getBookingDetail(UUID  bookingId);
    BookingDTO confirmBooking(UUID  bookingId, Long ownerId); // Owner xác nhận
    BookingDTO cancelBooking(UUID  bookingId, Long requesterId); // Owner/user huỷ
    BookingDTO completeBooking(UUID  bookingId, Long ownerId); // Owner hoàn tất
}