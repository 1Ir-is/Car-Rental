package com.example.car_rental_server.controller.user;

import com.example.car_rental_server.dto.ApprovalApplicationRequestDTO;
import com.example.car_rental_server.dto.ApprovalApplicationResponseDTO;
import com.example.car_rental_server.service.approval.ApprovalApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/approval-application")
@RequiredArgsConstructor
public class ApprovalApplicationController {
    private final ApprovalApplicationService approvalService;

    // User nộp đơn làm owner
    @PostMapping
    public ResponseEntity<?> submitApplication(@Valid @RequestBody ApprovalApplicationRequestDTO req, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        ApprovalApplicationResponseDTO result = approvalService.submitApplication(email, req);
        return ResponseEntity.ok(result);
    }

    // User xem đơn đã nộp
    @GetMapping
    public ResponseEntity<?> getUserApplication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        ApprovalApplicationResponseDTO resp = approvalService.getUserApplication(email);
        return ResponseEntity.ok(resp);
    }
}