package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @ModelAttribute
    public void addUserInfoToModel(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            model.addAttribute("currentUserName", user.getName());
            model.addAttribute("currentUserEmail", user.getEmail());
            // Nếu bạn có trường avatar trong User và dùng link ảnh thật:
            if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                model.addAttribute("currentUserAvatar", user.getAvatar());
            } else {
                // Nếu không có avatar thì truyền null, Thymeleaf sẽ xử lý fallback mặc định (UI Avatars)
                model.addAttribute("currentUserAvatar", null);
            }
        } else {
            // Fallback mặc định
            model.addAttribute("currentUserName", "Admin");
            model.addAttribute("currentUserEmail", "admin@autorent.com");
            model.addAttribute("currentUserAvatar", null);
        }
    }
}