package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);

    Boolean existsByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);
}