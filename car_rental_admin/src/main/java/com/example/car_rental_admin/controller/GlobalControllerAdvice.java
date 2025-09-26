package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {
    private final INotificationService notificationService;

    @ModelAttribute
    public void addNotificationsToModel(Model model) {
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());
    }
}