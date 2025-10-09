package com.example.car_rental_server.service.user;

import com.example.car_rental_server.dto.UserProfileDTO;
import com.example.car_rental_server.model.User;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    Optional<User> findByEmail(String email);

    User save(User user);

    Boolean existedByEmail(String email);

    Optional<User> findById(Long id);

    void remove(Long id);

    List<User> findAll();

    UserProfileDTO getCurrentUserInfo(String email);

    UserProfileDTO updateCurrentUserInfo(String email, UserProfileDTO userUpdateDTO);

    Optional<User> findByResetPasswordToken(String token);
}