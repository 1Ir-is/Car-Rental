package com.example.car_rental_server.service.vehicle;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService implements IVehicleService {
    private final IPostVehicleRepository postVehicleRepo;

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
                .ownerName(v.getOwnerName())     // Đúng là ownerName
                .ownerAvatar(v.getOwnerAvatar()) // Đúng là ownerAvatar
                .build();
    }

    @Override
    public List<PostVehicleDTO> getAllVehicles() {
        return postVehicleRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<PostVehicleDTO> getVehicleById(UUID id) {
        return postVehicleRepo.findById(id).map(this::toDTO);
    }
}