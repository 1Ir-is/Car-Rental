package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.service.user.IAdminService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminAuthController {
    private final IAdminService adminService;

    @GetMapping("/login")
    public String loginPage() {
        return "admin/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        User admin = (User) authentication.getPrincipal();
        model.addAttribute("admin", admin);
        model.addAttribute("currentUserName", admin.getName());
        model.addAttribute("currentUserEmail", admin.getEmail());
        model.addAttribute("activeMenu", "dashboard");
        return "admin/dashboard";
    }

    @GetMapping("/change-password")
    public String changePasswordPage() {
        return "admin/change-password";
    }

    @PostMapping("/change-password")
    public String changePassword(Authentication authentication,
                                 @RequestParam String oldPassword,
                                 @RequestParam String newPassword,
                                 Model model) {
        User admin = (User) authentication.getPrincipal();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (!encoder.matches(oldPassword, admin.getPassword())) {
            model.addAttribute("error", "Mật khẩu cũ không đúng");
            return "admin/change-password";
        }
        adminService.changePassword(admin, newPassword);
        model.addAttribute("success", "Đổi mật khẩu thành công");
        return "admin/change-password";
    }

    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return "redirect:/admin/login?logout";
    }
}