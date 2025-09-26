package com.example.car_rental_admin.service.customer;

import com.example.car_rental_admin.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ICustomerService {
    Optional<User> getUserById(Long id);

    long countAll();

    long countByStatus(boolean status);

    long countNewUsersThisMonth();

    Page<User> searchUsers(String search, String role, String status, Pageable pageable);
}
