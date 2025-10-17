package com.example.car_rental_server.service.owner;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.enums.VehicleStatus;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IUserRepository;
import com.example.car_rental_server.service.notification.INotificationService;
import com.example.car_rental_server.utils.MailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostVehicleService implements IPostVehicleService {
    private final IPostVehicleRepository postVehicleRepo;
    private final IUserRepository userRepository;
    private final MailService mailService;
    private final INotificationService notificationService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.admin.url:http://localhost:8081}")
    private String adminUrl;

    @Value("${app.admin.email:}")
    private String adminEmail;

    private PostVehicleDTO toDTO(PostVehicle v) {
        return PostVehicleDTO.builder()
                .id(v.getId())
                .vehicleName(v.getVehicleName())
                .brand(v.getBrand())
                .model(v.getModel())
                .year(v.getYear())
                .color(v.getColor())
                .licensePlate(v.getLicensePlate())
                .vehicleSeat(v.getVehicleSeat())
                .transmission(v.getTransmission())
                .fuelType(v.getFuelType())
                .dailyPrice(v.getDailyPrice())
                .description(v.getDescription())
                .category(v.getCategory())
                .imageList(v.getImageList())
                .features(v.getFeatures())
                .address(v.getAddress())
                .placeId(v.getPlaceId())
                .latitude(v.getLatitude())
                .longitude(v.getLongitude())
                .status(v.getStatus())
                .isRented(v.getIsRented())
                .rating(v.getRating())
                .userId(v.getUser() != null ? v.getUser().getId() : null)
                .build();
    }

    private PostVehicle toEntity(PostVehicleDTO dto) {
        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId()).orElse(null);
        }
        return PostVehicle.builder()
                .id(dto.getId())
                .vehicleName(dto.getVehicleName())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .year(dto.getYear())
                .color(dto.getColor())
                .licensePlate(dto.getLicensePlate())
                .vehicleSeat(dto.getVehicleSeat())
                .transmission(dto.getTransmission())
                .fuelType(dto.getFuelType())
                .dailyPrice(dto.getDailyPrice())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .imageList(dto.getImageList())
                .features(dto.getFeatures())
                .address(dto.getAddress())
                .placeId(dto.getPlaceId())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .status(dto.getStatus())
                .isRented(dto.getIsRented())
                .rating(dto.getRating())
                .user(user)
                .build();
    }

    @Override
    public List<PostVehicleDTO> getAllVehicles() {
        return postVehicleRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PostVehicleDTO> getVehiclesByOwner(Long userId) {
        return postVehicleRepo.findByUser_Id(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<PostVehicleDTO> getVehicleById(UUID id) {
        return postVehicleRepo.findById(id).map(this::toDTO);
    }

    @Override
    public PostVehicleDTO createVehicle(PostVehicleDTO dto) {
        PostVehicle vehicle = toEntity(dto);
        vehicle.setId(null);
        vehicle.setStatus(VehicleStatus.PENDING); // Đặt luôn PENDING khi tạo mới
        vehicle = postVehicleRepo.save(vehicle);
        PostVehicleDTO createdDto = toDTO(vehicle);

        // --- Create notification + Send emails: best-effort (log errors, don't break creation) ---
        try {
            User owner = vehicle.getUser();

            // Notify admin
            if (owner != null) {
                try {
                    String vehicleIdStr = vehicle.getId() != null ? vehicle.getId().toString() : null;
                    notificationService.notifyVehicleSubmission(owner.getId(), owner.getName(), vehicleIdStr, vehicle.getVehicleName());
                } catch (Exception e) {
                    System.err.println("Failed to create/broadcast notification for new vehicle: " + e.getMessage());
                }
            }

            // Mail to owner
            if (owner != null && owner.getEmail() != null) {
                String ownerAppUrl = frontendUrl;
                try {
                    mailService.sendVehiclePendingToOwner(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), ownerAppUrl);
                } catch (MessagingException | UnsupportedEncodingException me) {
                    System.err.println("Failed to send pending mail to owner: " + me.getMessage());
                }
            }

            // Mail to admin
            if (adminEmail != null && !adminEmail.isBlank()) {
                String ownerName = owner != null ? owner.getName() : "Owner";
                String ownerEmail = owner != null ? owner.getEmail() : "";
                String adminPanelUrl = adminUrl;
                try {
                    mailService.sendVehicleSubmissionNotificationToAdmin(adminEmail, ownerName, ownerEmail, vehicle.getVehicleName(), adminPanelUrl);
                } catch (MessagingException | UnsupportedEncodingException me) {
                    System.err.println("Failed to send vehicle submission mail to admin: " + me.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Unexpected error when sending vehicle emails/notifications: " + e.getMessage());
        }

        return createdDto;
    }

    @Override
    public PostVehicleDTO updateVehicle(UUID id, PostVehicleDTO dto) {
        PostVehicle vehicle = postVehicleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Ownership check: ensure the caller (dto.userId) matches the vehicle owner
        if (dto.getUserId() == null || vehicle.getUser() == null || !vehicle.getUser().getId().equals(dto.getUserId())) {
            throw new RuntimeException("Unauthorized: you can only update your own vehicle");
        }

        // Save old status to detect REJECTED -> resubmit transition
        VehicleStatus oldStatus = vehicle.getStatus();

        // Update fields (only the allowed ones)
        vehicle.setVehicleName(dto.getVehicleName());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setColor(dto.getColor());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setVehicleSeat(dto.getVehicleSeat());
        vehicle.setTransmission(dto.getTransmission());
        vehicle.setFuelType(dto.getFuelType());
        vehicle.setDailyPrice(dto.getDailyPrice());
        vehicle.setDescription(dto.getDescription());
        vehicle.setCategory(dto.getCategory());
        vehicle.setImageList(dto.getImageList());
        vehicle.setFeatures(dto.getFeatures());
        vehicle.setAddress(dto.getAddress());
        vehicle.setPlaceId(dto.getPlaceId());
        vehicle.setLatitude(dto.getLatitude());
        vehicle.setLongitude(dto.getLongitude());
        vehicle.setIsRented(dto.getIsRented());
        vehicle.setRating(dto.getRating());

        // If vehicle was previously REJECTED and owner updates it, mark it as PENDING again and clear rejection reason
        if (oldStatus == VehicleStatus.REJECTED) {
            vehicle.setStatus(VehicleStatus.PENDING);
            vehicle.setRejectionReason(null);
            vehicle.setUnavailableReason(null);
        } else {
            // Otherwise, if DTO explicitly included a status, respect it (optional)
            if (dto.getStatus() != null) {
                vehicle.setStatus(dto.getStatus());
                // clear reasons if appropriate
                if (dto.getStatus() != VehicleStatus.REJECTED) {
                    vehicle.setRejectionReason(null);
                }
                if (dto.getStatus() != VehicleStatus.UNAVAILABLE) {
                    vehicle.setUnavailableReason(null);
                }
            }
        }

        vehicle = postVehicleRepo.save(vehicle);
        PostVehicleDTO updatedDto = toDTO(vehicle);

        // If owner resubmitted a previously rejected vehicle, notify admin + send confirmation email (best-effort)
        if (oldStatus == VehicleStatus.REJECTED) {
            try {
                User owner = vehicle.getUser();
                String vehicleIdStr = vehicle.getId() != null ? vehicle.getId().toString() : null;

                // Notification to admin
                try {
                    notificationService.notifyVehicleSubmission(owner.getId(), owner.getName(), vehicleIdStr, vehicle.getVehicleName());
                } catch (Exception ex) {
                    System.err.println("Failed to notify admin about vehicle resubmission: " + ex.getMessage());
                }

                // Email to owner confirming resubmission
                try {
                    if (owner != null && owner.getEmail() != null) {
                        mailService.sendVehiclePendingToOwner(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), frontendUrl);
                    }
                } catch (MessagingException | UnsupportedEncodingException me) {
                    System.err.println("Failed to send resubmission mail to owner: " + me.getMessage());
                }

                // Email to admin
                if (adminEmail != null && !adminEmail.isBlank()) {
                    try {
                        String ownerName = owner != null ? owner.getName() : "Owner";
                        String ownerEmail = owner != null ? owner.getEmail() : "";
                        mailService.sendVehicleSubmissionNotificationToAdmin(adminEmail, ownerName, ownerEmail, vehicle.getVehicleName(), adminUrl);
                    } catch (MessagingException | UnsupportedEncodingException me) {
                        System.err.println("Failed to send resubmission mail to admin: " + me.getMessage());
                    }
                }
            } catch (Exception e) {
                System.err.println("Unexpected error when handling resubmission notifications/emails: " + e.getMessage());
            }
        }

        return updatedDto;
    }

    @Override
    public void deleteVehicle(UUID id) {
        postVehicleRepo.deleteById(id);
    }
}