package com.example.car_rental_admin.service.role;

import com.example.car_rental_admin.enums.RoleType;
import com.example.car_rental_admin.enums.UserStatus;

import java.util.List;

public interface IRoleService {
    List<RoleType> getAllRoles();

    List<UserStatus> getAllUserStatuses();
}