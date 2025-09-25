package com.example.car_rental_admin.service.role;

import com.example.car_rental_admin.enums.RoleType;
import com.example.car_rental_admin.enums.UserStatus;
import com.example.car_rental_admin.repository.IRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {
    private final IRoleRepository roleRepository;

    @Override
    public List<RoleType> getAllRoles() {
        return Arrays.stream(RoleType.values())
                .filter(role -> role != RoleType.ADMIN)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserStatus> getAllUserStatuses() {
        return Arrays.asList(UserStatus.values());
    }
}