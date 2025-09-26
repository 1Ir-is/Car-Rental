package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.ApprovalApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IApprovalApplicationRepository extends JpaRepository<ApprovalApplication, Long> {
}
