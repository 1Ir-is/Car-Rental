package com.example.car_rental_admin.service.approval;

import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.model.User;

import java.util.List;

public interface IApprovalApplicationService {
    List<ApprovalApplication> getAllApprovalApplication();

    long countPending();

    long countApproved();

    long countRejected();

    void approveApplication(Long id);

    void rejectApplication(Long id);

    void revokeApplication(Long id);

    void submitApplication(User user, ApprovalApplication app);
}
