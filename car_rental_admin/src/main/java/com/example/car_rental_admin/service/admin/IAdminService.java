package com.example.car_rental_admin.service.admin;

import com.example.car_rental_admin.model.User;

public interface IAdminService {
    User findByEmail(String email);
    void changePassword(User user, String newPassword);
}