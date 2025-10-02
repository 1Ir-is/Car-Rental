package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.Notification;
import com.example.car_rental_admin.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/notifications/api")
@RequiredArgsConstructor
public class AdminNotificationRestController {
    private final INotificationService notificationService;

    @PostMapping("/create")
    public Notification createNotification(@RequestBody Notification noti) {
        // Nên dùng DTO, đây chỉ demo
        return notificationService.createNotification(noti);
    }

    @GetMapping("/latest")
    public List<Notification> getLatestNotifications(@RequestParam(defaultValue = "5") int limit) {
        return notificationService.getLatestNotifications(limit);
    }

    @PostMapping("/mark-all-read")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }
}