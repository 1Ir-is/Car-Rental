package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.dto.BookingDTO;
import com.example.car_rental_server.service.owner.IPostVehicleService;
import com.example.car_rental_server.service.booking.IBookingService;
import com.example.car_rental_server.service.user.IUserService;
import com.example.car_rental_server.utils.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/vehicles")
@RequiredArgsConstructor
public class OwnerVehicleController {

    private final IPostVehicleService vehicleService;
    private final CloudinaryService cloudinaryService;
    private final IBookingService bookingService;
    private final IUserService userService;

    // Lấy tất cả xe của owner hiện tại
    @GetMapping("/my")
    public ResponseEntity<?> getMyVehicles(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long ownerId = userService.findIdByEmail(email);
        List<PostVehicleDTO> list = vehicleService.getVehiclesByOwner(ownerId);
        return ResponseEntity.ok(list);
    }

    // Lấy chi tiết 1 xe
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(@PathVariable UUID id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Đăng xe mới: nhận dữ liệu thông tin xe và nhiều ảnh
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createVehicle(
            @RequestPart("info") PostVehicleDTO dto,
            @RequestPart(value = "images", required = false) MultipartFile[] images,
            Authentication authentication
    ) {
        List<String> imageUrls = new ArrayList<>();
        if (images != null && images.length > 0) {
            for (MultipartFile file : images) {
                try {
                    String url = cloudinaryService.uploadMultipart(file);
                    imageUrls.add(url);
                } catch (Exception ex) {
                    return ResponseEntity.badRequest().body("Failed to upload: " + file.getOriginalFilename());
                }
            }
        }
        dto.setImageList(imageUrls);

        if (dto.getOwnerId() == null && authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            Long ownerId = userService.findIdByEmail(email);
            dto.setOwnerId(ownerId);
        }

        if (dto.getOwnerId() == null) {
            return ResponseEntity.badRequest().body("Missing owner (userId)");
        }

        PostVehicleDTO created = vehicleService.createVehicle(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateVehicle(
            @PathVariable UUID id,
            @RequestPart("info") PostVehicleDTO dto,
            @RequestPart(value = "images", required = false) MultipartFile[] images
    ) {
        List<String> imageUrls = new ArrayList<>();
        if (images != null && images.length > 0) {
            for (MultipartFile file : images) {
                try {
                    String url = cloudinaryService.uploadMultipart(file);
                    imageUrls.add(url);
                } catch (Exception ex) {
                    return ResponseEntity.badRequest().body("Failed to upload: " + file.getOriginalFilename());
                }
            }
            dto.setImageList(imageUrls);
        } else {
            if (dto.getKeepExistingImages() != null && !dto.getKeepExistingImages().isEmpty()) {
                dto.setImageList(dto.getKeepExistingImages());
            }
        }
        PostVehicleDTO updated = vehicleService.updateVehicle(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Xóa xe
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok().build();
    }

    // Nếu vẫn muốn gọi API upload ảnh riêng
    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                String url = cloudinaryService.uploadMultipart(file);
                urls.add(url);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body("Failed to upload: " + file.getOriginalFilename());
            }
        }
        return ResponseEntity.ok(urls);
    }

    // ==== BOOKING CHO OWNER ====

    // Owner xem tất cả booking liên quan đến mình
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getOwnerBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long ownerId = userService.findIdByEmail(email);
        return ResponseEntity.ok(bookingService.getOwnerBookings(ownerId));
    }

    // Owner xác nhận booking
    @PostMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long ownerId = userService.findIdByEmail(email);
        BookingDTO booking = bookingService.confirmBooking(id, ownerId);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.badRequest().body("Confirm failed");
    }

    // Owner hoàn tất booking
    @PostMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long ownerId = userService.findIdByEmail(email);
        BookingDTO booking = bookingService.completeBooking(id, ownerId);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.badRequest().body("Complete failed");
    }

    // Owner huỷ booking
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable UUID id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Long ownerId = userService.findIdByEmail(email);
        BookingDTO booking = bookingService.cancelBooking(id, ownerId);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.badRequest().body("Cancel failed");
    }
}