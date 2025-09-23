package com.example.car_rental_admin.repository;


import com.example.car_rental_admin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IAdminUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}