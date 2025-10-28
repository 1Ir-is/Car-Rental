package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.UserProfileDTO;
import com.example.car_rental_server.dto.BookingDTO;
import com.example.car_rental_server.service.user.IUserService;
import com.example.car_rental_server.service.booking.IBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;
    private final IBookingService bookingService;

    // Lấy thông tin profile user hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        UserProfileDTO userInfo = userService.getCurrentUserInfo(email);
        return ResponseEntity.ok(userInfo);
    }

    // Cập nhật thông tin profile user hiện tại
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UserProfileDTO userUpdateDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        UserProfileDTO updated = userService.updateCurrentUserInfo(email, userUpdateDTO);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody BookingDTO dto, Authentication authentication) {
        System.out.println("==== DEBUG BookingController ====");
        System.out.println("Auth: " + authentication);
        if (authentication != null) {
            System.out.println("Principal: " + authentication.getPrincipal());
            System.out.println("Authorities: " + authentication.getAuthorities());
            System.out.println("Is Authenticated: " + authentication.isAuthenticated());
        }
        String email = authentication != null ? authentication.getName() : "null";
        Long userId = userService.findIdByEmail(email);
        System.out.println("UserId: " + userId);
        System.out.println("DTO: " + dto);

        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("ERROR: authentication missing or not authenticated!");
            return ResponseEntity.status(401).body("Not authenticated");
        }

        dto.setUserId(userId);

        BookingDTO created = null;
        try {
            created = bookingService.createBooking(dto);
            if (created == null) {
                System.out.println("ERROR: BookingService.createBooking trả về null!");
                // Kiểm tra xem lỗi do user hay vehicle
                boolean userExist = userService.findIdByEmail(email) != null;
                boolean vehicleExist = dto.getVehicleId() != null &&
                        bookingService.getBookingDetail(dto.getVehicleId()) != null;
                if (!userExist) {
                    return ResponseEntity.status(400).body("User không tồn tại!");
                }
                if (!vehicleExist) {
                    return ResponseEntity.status(400).body("Xe không tồn tại!");
                }
                return ResponseEntity.status(400).body("Booking failed! Dữ liệu không hợp lệ.");
            }
        } catch (Exception e) {
            System.out.println("ERROR: Exception khi tạo booking: " + e.getMessage());
            return ResponseEntity.status(500).body("Lỗi server khi tạo booking: " + e.getMessage());
        }

        return ResponseEntity.ok(created);
    }

    // Xem lịch sử booking của user
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getMyBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long userId = userService.findIdByEmail(email);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // Xem chi tiết 1 booking của user
    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBookingDetail(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long userId = userService.findIdByEmail(email);
        BookingDTO booking = bookingService.getBookingDetail(id);
        if (booking == null || !booking.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(booking);
    }

    // User huỷ booking của mình
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long userId = userService.findIdByEmail(email);
        BookingDTO booking = bookingService.cancelBooking(id, userId);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.badRequest().body("Cancel failed");
    }
}