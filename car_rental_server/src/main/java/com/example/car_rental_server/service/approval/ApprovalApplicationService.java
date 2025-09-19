package com.example.car_rental_server.service.approval;

import com.example.car_rental_server.dto.ApprovalApplicationRequestDTO;
import com.example.car_rental_server.dto.ApprovalApplicationResponseDTO;
import com.example.car_rental_server.enums.RequestStatus;
import com.example.car_rental_server.model.ApprovalApplication;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IApprovalApplicationRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApprovalApplicationService implements IApprovalApplicationService {
    private final IApprovalApplicationRepository applicationRepo;
    private final IUserRepository userRepo;

    @Override
    public ApprovalApplicationResponseDTO submitApplication(String userEmail, ApprovalApplicationRequestDTO req) {
        User user = userRepo.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        ApprovalApplication app = applicationRepo.findByUser(user).orElse(ApprovalApplication.builder().user(user).build());
        app.setName(req.getName());
        app.setPhone(req.getPhone());
        app.setEmail(req.getEmail());
        app.setAddress(req.getAddress());
        app.setIdentity(req.getIdentity());
        app.setTitle(req.getTitle());
        app.setDescription(req.getDescription());
        app.setType(req.getType());
        app.setStatus(RequestStatus.PENDING);

        ApprovalApplication saved = applicationRepo.save(app);

        ApprovalApplicationResponseDTO resp = new ApprovalApplicationResponseDTO();
        resp.setId(saved.getId());
        resp.setName(saved.getName());
        resp.setPhone(saved.getPhone());
        resp.setEmail(saved.getEmail());
        resp.setAddress(saved.getAddress());
        resp.setIdentity(saved.getIdentity());
        resp.setTitle(saved.getTitle());
        resp.setDescription(saved.getDescription());
        resp.setType(saved.getType());
        resp.setStatus(saved.getStatus());
        return resp;
    }

    @Override
    public ApprovalApplicationResponseDTO getUserApplication(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        ApprovalApplication app = applicationRepo.findByUser(user).orElse(null);
        if (app == null) return null;
        ApprovalApplicationResponseDTO resp = new ApprovalApplicationResponseDTO();
        resp.setId(app.getId());
        resp.setName(app.getName());
        resp.setPhone(app.getPhone());
        resp.setEmail(app.getEmail());
        resp.setAddress(app.getAddress());
        resp.setIdentity(app.getIdentity());
        resp.setTitle(app.getTitle());
        resp.setDescription(app.getDescription());
        resp.setType(app.getType());
        resp.setStatus(app.getStatus());
        return resp;
    }
}