package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.ApprovalApplicationRequestDTO;
import com.example.car_rental_server.dto.ApprovalApplicationResponseDTO;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.service.approval.ApprovalApplicationService;
import com.example.car_rental_server.service.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/approval-application")
@RequiredArgsConstructor
public class ApprovalApplicationController {
    private final ApprovalApplicationService approvalService;
    private final SimpMessagingTemplate messagingTemplate;
    private final IUserService userService;

    // User nộp đơn làm owner
    @PostMapping
    public ResponseEntity<?> submitApplication(@Valid @RequestBody ApprovalApplicationRequestDTO req, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        ApprovalApplicationResponseDTO result = approvalService.submitApplication(email, req);

        String name = userService.findByEmail(email).map(User::getName).orElse(email);

        // Tạo notification gửi tới admin
        Map<String, Object> notification = Map.of(
                "type", "OWNER_REQUEST",
                "content", "Người dùng " + name + " vừa gửi đơn trở thành owner!",
                "createdAt", System.currentTimeMillis(),
                "url", "/admin/approval-application"
        );

        // Gửi notify qua websocket
        messagingTemplate.convertAndSend("/topic/owner-request", notification);

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