package com.example.car_rental_server.service.approval;

import com.example.car_rental_server.dto.ApprovalApplicationRequestDTO;
import com.example.car_rental_server.dto.ApprovalApplicationResponseDTO;

public interface IApprovalApplicationService {
    ApprovalApplicationResponseDTO submitApplication(String userEmail, ApprovalApplicationRequestDTO req);

    ApprovalApplicationResponseDTO getUserApplication(String email);
}
