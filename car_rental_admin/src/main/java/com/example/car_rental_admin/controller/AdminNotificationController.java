package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.service.notification.INotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {
    private final INotificationService notificationService;

    @PostMapping("/mark-all-read")
    public String markAllAsRead(HttpServletRequest request) {
        notificationService.markAllAsRead();
        String referer = request.getHeader("Referer");
        return "redirect:" + (referer != null ? referer : "/admin/dashboard");
    }
}