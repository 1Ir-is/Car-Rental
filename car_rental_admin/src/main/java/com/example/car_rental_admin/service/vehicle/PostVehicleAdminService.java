package com.example.car_rental_admin.service.vehicle;

import com.example.car_rental_admin.enums.VehicleStatus;
import com.example.car_rental_admin.model.PostVehicle;
import com.example.car_rental_admin.repository.IPostVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostVehicleAdminService implements IPostVehicleAdminService {
    private final IPostVehicleRepository postVehicleRepository;

    @Override
    public Page<PostVehicle> searchVehicles(String query, String brand, String status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);

        VehicleStatus enumStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                enumStatus = VehicleStatus.valueOf(status.toUpperCase());
            } catch (Exception e) {
                enumStatus = null;
            }
        }

        if (brand != null && !brand.isBlank() && enumStatus != null) {
            return postVehicleRepository.findByBrandIgnoreCaseAndStatus(brand, enumStatus, pageable);
        }
        return postVehicleRepository
                .findByVehicleNameContainingIgnoreCaseOrLicensePlateContainingIgnoreCaseOrBrandContainingIgnoreCase(
                        query == null ? "" : query,
                        query == null ? "" : query,
                        query == null ? "" : query,
                        pageable);
    }

    @Override
    public Optional<PostVehicle> findVehicleById(UUID id) {
        return postVehicleRepository.findById(id);
    }

    @Override
    public long countTotalVehicles() {
        return postVehicleRepository.count();
    }

    // Đếm theo Enum
    @Override
    public long countVehiclesByStatus(String status) {
        try {
            VehicleStatus enumStatus = VehicleStatus.valueOf(status.toUpperCase());
            return postVehicleRepository.countByStatus(enumStatus);
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public boolean approveVehicle(UUID id) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.PENDING) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                postVehicleRepository.save(vehicle);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean rejectVehicle(UUID id, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.PENDING) {
                vehicle.setStatus(VehicleStatus.REJECTED);
                vehicle.setRejectionReason(reason);
                postVehicleRepository.save(vehicle);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean makeUnavailable(UUID id, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.UNAVAILABLE);
                vehicle.setUnavailableReason(reason);
                postVehicleRepository.save(vehicle);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean updateVehicleStatus(UUID id, VehicleStatus status, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            vehicle.setStatus(status);
            // Xử lý lý do reject hoặc unavailable
            if (status == VehicleStatus.REJECTED) {
                vehicle.setRejectionReason(reason);
                vehicle.setUnavailableReason(null);
            } else if (status == VehicleStatus.UNAVAILABLE) {
                vehicle.setUnavailableReason(reason);
                vehicle.setRejectionReason(null);
            } else {
                vehicle.setRejectionReason(null);
                vehicle.setUnavailableReason(null);
            }
            postVehicleRepository.save(vehicle);
            return true;
        }
        return false;
    }
}