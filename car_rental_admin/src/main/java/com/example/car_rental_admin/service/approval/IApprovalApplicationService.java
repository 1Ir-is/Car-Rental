package com.example.car_rental_admin.service.approval;

import com.example.car_rental_admin.model.ApprovalApplication;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IApprovalApplicationService {
    List<ApprovalApplication> getAllApprovalApplication();

    long countPending();

    long countApproved();

    long countRejected();

    ApprovalApplication approveApplication(Long id);

    ApprovalApplication rejectApplication(Long id);

    ApprovalApplication revokeApplication(Long id);

    Page<ApprovalApplication> findApprovalApplications(String status, String type, String search, int page, int size);

    List<String> findAllStatuses();

    List<String> findAllTypes();
}
