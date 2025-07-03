package com.example.carrentalserver.controller;

import com.example.carrentalserver.dto.JwtResponse;
import com.example.carrentalserver.dto.LoginRequest;
import com.example.carrentalserver.dto.RegisterRequest;
import com.example.carrentalserver.model.Role;
import com.example.carrentalserver.model.User;
import com.example.carrentalserver.repository.IRoleRepository;
import com.example.carrentalserver.repository.IUserRepository;
import com.example.carrentalserver.security.JwtProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new Role(null, "USER", "User role")));
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setStatus("ACTIVE");
        user.setRoles(Collections.singleton(userRole));
        userRepository.save(user);
        return ResponseEntity.ok("Registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String token = jwtProvider.generateToken(user);
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        // Redirect đến trang xác thực của Google
        response.sendRedirect("/oauth2/authorization/google");
    }
}