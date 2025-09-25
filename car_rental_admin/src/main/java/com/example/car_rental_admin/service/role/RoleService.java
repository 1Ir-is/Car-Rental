package com.example.car_rental_admin.service.role;

import com.example.car_rental_admin.enums.RoleType;
import com.example.car_rental_admin.enums.UserStatus;
import com.example.car_rental_admin.repository.IRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {
    private final IRoleRepository roleRepository;

    public List<RoleType> getAllRoles() {
        return Arrays.asList(RoleType.values());
    }

    public List<UserStatus> getAllUserStatuses() {
        return Arrays.asList(UserStatus.values());
    }
}