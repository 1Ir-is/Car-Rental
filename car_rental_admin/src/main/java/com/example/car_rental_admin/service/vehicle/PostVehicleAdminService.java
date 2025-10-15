package com.example.car_rental_admin.service.vehicle;

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

        // Nếu lọc brand hoặc status
        if (brand != null && !brand.isBlank() && status != null && !status.isBlank()) {
            return postVehicleRepository.findByBrandIgnoreCaseAndStatusIgnoreCase(brand, status, pageable);
        }
        // Nếu chỉ tìm kiếm chung
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

    @Override
    public long countVehiclesByStatus(String status) {
        return postVehicleRepository.countByStatusIgnoreCase(status);
    }
}