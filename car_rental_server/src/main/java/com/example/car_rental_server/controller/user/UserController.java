package com.example.car_rental_server.controller.user;

import com.example.car_rental_server.dto.UserProfileDTO;
import com.example.car_rental_server.service.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;

    // Lấy thông tin profile user hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        UserProfileDTO userInfo = userService.getCurrentUserInfo(email);
        return ResponseEntity.ok(userInfo);
    }

    // Cập nhật thông tin profile user hiện tại
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UserProfileDTO userUpdateDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        UserProfileDTO updated = userService.updateCurrentUserInfo(email, userUpdateDTO);
        return ResponseEntity.ok(updated);
    }
}