package com.example.carrentaladminsite.config;

import com.example.carrentaladminsite.model.Role;
import com.example.carrentaladminsite.model.User;
import com.example.carrentaladminsite.repository.IRoleRepository;
import com.example.carrentaladminsite.repository.IUserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class AdminInitializer {
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initAdmin() {
        if (userRepository.existsByUsername("admin")) return;

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(
                        null, "ADMIN", "Admin role"
                )));

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@gmail.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setStatus("ACTIVE");
        admin.setRoles(Collections.singleton(adminRole));
        userRepository.save(admin);
    }
}
