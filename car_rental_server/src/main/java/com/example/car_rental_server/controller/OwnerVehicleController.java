package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.service.vehicle.IPostVehicleService;
import com.example.car_rental_server.utils.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/owner/vehicles")
@RequiredArgsConstructor
public class OwnerVehicleController {

    private final IPostVehicleService vehicleService;
    private final CloudinaryService cloudinaryService;

    // Lấy tất cả xe của owner hiện tại
    @GetMapping("/my")
    public ResponseEntity<?> getMyVehicles(@RequestParam Long userId) {
        List<PostVehicleDTO> list = vehicleService.getVehiclesByOwner(userId);
        return ResponseEntity.ok(list);
    }

    // Lấy chi tiết 1 xe
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Đăng xe mới: nhận dữ liệu thông tin xe và nhiều ảnh
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createVehicle(
            @RequestPart("info") PostVehicleDTO dto,
            @RequestPart(value = "images", required = false) MultipartFile[] images
    ) {
        // Upload ảnh lên Cloudinary nếu có
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
        PostVehicleDTO created = vehicleService.createVehicle(dto);
        return ResponseEntity.ok(created);
    }

    // Sửa thông tin xe (có thể cho phép cập nhật lại ảnh)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id,
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
        }
        PostVehicleDTO updated = vehicleService.updateVehicle(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Xóa xe
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
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
}