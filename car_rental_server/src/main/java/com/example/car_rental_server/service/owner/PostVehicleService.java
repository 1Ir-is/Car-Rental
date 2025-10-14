package com.example.car_rental_server.service.owner;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostVehicleServiceImpl implements IPostVehicleService {
    private final IPostVehicleRepository postVehicleRepo;
    private final IUserRepository userRepository;

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
    public Optional<PostVehicleDTO> getVehicleById(Long id) {
        return postVehicleRepo.findById(id).map(this::toDTO);
    }

    @Override
    public PostVehicleDTO createVehicle(PostVehicleDTO dto) {
        PostVehicle vehicle = toEntity(dto);
        vehicle.setId(null);
        vehicle = postVehicleRepo.save(vehicle);
        return toDTO(vehicle);
    }

    @Override
    public PostVehicleDTO updateVehicle(Long id, PostVehicleDTO dto) {
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
    public void deleteVehicle(Long id) {
        postVehicleRepo.deleteById(id);
    }
}