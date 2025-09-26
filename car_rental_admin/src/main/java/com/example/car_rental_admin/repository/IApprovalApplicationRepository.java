package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IApprovalApplicationRepository
        extends JpaRepository<ApprovalApplication, Long>, JpaSpecificationExecutor<ApprovalApplication> {
    long countByStatus(RequestStatus status);

    Optional<ApprovalApplication> findById(Long id);

    @Query("select distinct a.status from ApprovalApplication a")
    List<String> findDistinctStatus();

    @Query("select distinct a.type from ApprovalApplication a")
    List<String> findDistinctType();
}