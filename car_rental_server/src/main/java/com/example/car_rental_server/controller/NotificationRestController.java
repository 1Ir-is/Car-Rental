package com.example.car_rental_server.controller;

import com.example.car_rental_server.model.Notification;
import com.example.car_rental_server.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationRestController {
    private final INotificationService notificationService;

    @PostMapping("/users/{userId}/create")
    public ResponseEntity<Notification> createForUser(@PathVariable Long userId, @RequestBody Notification noti) {
        Notification saved = notificationService.createNotificationForUser(userId, noti);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/users/{userId}/latest")
    public ResponseEntity<List<Notification>> latestForUser(@PathVariable Long userId,
                                                            @RequestParam(name="limit", defaultValue="5") int limit) {
        List<Notification> list = notificationService.getLatestNotificationsForUser(userId, limit);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/users/{userId}/mark-read/{id}")
    public ResponseEntity<?> markAsReadForUser(@PathVariable Long userId, @PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/mark-all-read")
    public ResponseEntity<?> markAllReadForUser(@PathVariable Long userId) {
        notificationService.markAllReadForUser(userId);
        return ResponseEntity.ok().build();
    }
}