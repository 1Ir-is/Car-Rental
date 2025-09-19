package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.ApprovalApplication;
import com.example.car_rental_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IApprovalApplicationRepository extends JpaRepository<ApprovalApplication, Long> {
    Optional<ApprovalApplication> findByUser(User user);
}