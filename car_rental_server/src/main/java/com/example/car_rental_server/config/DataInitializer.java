package com.example.car_rental_server.config;

import com.example.car_rental_server.model.Role;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.service.role.IRoleService;
import com.example.car_rental_server.service.user.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final IUserService userService;
    private final IRoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initRolesAndAdmin() {
        return args -> {
            // Seed roles
            String[] roles = {"ADMIN", "USER", "OWNER"};
            for (String roleName : roles) {
                roleService.findByName(roleName).orElseGet(() -> {
                    Role r = new Role();
                    r.setName(roleName);
                    return roleService.save(r);
                });
            }

            // Seed admin user
            if (userService.findByEmail("admin@gmail.com").isEmpty()) {
                Role adminRole = roleService.findByName("ADMIN").get();
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@gmail.com");
                admin.setPassword("123456"); // mã hóa password
                admin.setStatus(true);
                admin.setRole(adminRole);
                userService.save(admin);
                System.out.println("Admin user created!");
            }
        };
    }
}