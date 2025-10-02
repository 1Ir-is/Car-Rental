package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.Notification;
import com.example.car_rental_admin.service.notification.INotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping
    public String allNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model
    ) {
        Page<Notification> notiPage = notificationService.findAllNotifications(page - 1, size);
        model.addAttribute("notifications", notiPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", notiPage.getTotalPages());
        model.addAttribute("totalElements", notiPage.getTotalElements());
        model.addAttribute("size", size);
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());
        return "admin/notifications-list";
    }
}