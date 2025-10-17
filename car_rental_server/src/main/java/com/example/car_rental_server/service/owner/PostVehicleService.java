package com.example.car_rental_server.service.owner;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.enums.VehicleStatus;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IUserRepository;
import com.example.car_rental_server.utils.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
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

        // --- Send emails: best-effort (log errors, don't break creation) ---
        try {
            User owner = vehicle.getUser();

            // Mail to owner: your vehicle is pending review (owner frontend URL)
            if (owner != null && owner.getEmail() != null) {
                String ownerAppUrl = frontendUrl; // example: http://localhost:3000
                mailService.sendVehiclePendingToOwner(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), ownerAppUrl);
            }

            // Mail to admin: notify new vehicle submission (admin panel URL)
            if (adminEmail != null && !adminEmail.isBlank()) {
                String ownerName = owner != null ? owner.getName() : "Owner";
                String ownerEmail = owner != null ? owner.getEmail() : "";
                String adminPanelUrl = adminUrl; // example: http://localhost:8081
                mailService.sendVehicleSubmissionNotificationToAdmin(adminEmail, ownerName, ownerEmail, vehicle.getVehicleName(), adminPanelUrl);
            }
        } catch (MessagingException | UnsupportedEncodingException e) {
            // log and continue - do not fail creation because mail failed
            System.err.println("Failed to send new-vehicle emails: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error when sending vehicle emails: " + e.getMessage());
        }

        return createdDto;
    }

    @Override
    public PostVehicleDTO updateVehicle(UUID id, PostVehicleDTO dto) {
        PostVehicle vehicle = postVehicleRepo.findById(id).orElseThrow(() -> new RuntimeException("Vehicle not found"));
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
        vehicle.setStatus(dto.getStatus());
        vehicle.setIsRented(dto.getIsRented());
        vehicle.setRating(dto.getRating());
        vehicle = postVehicleRepo.save(vehicle);
        return toDTO(vehicle);
    }

    @Override
    public void deleteVehicle(UUID id) {
        postVehicleRepo.deleteById(id);
    }
}