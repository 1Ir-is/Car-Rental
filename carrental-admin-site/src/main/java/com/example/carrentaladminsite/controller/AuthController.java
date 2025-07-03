package com.example.carrentaladminsite.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {
    @GetMapping("/login")
    public String login(
            @RequestParam(value = "timeout", required = false) String timeout,
            Model model,
            Authentication authentication
    ) {
        if (authentication != null && authentication.isAuthenticated()) {
            String className = authentication.getPrincipal().getClass().getSimpleName();
            if (!"String".equals(className) || !"anonymousUser".equals(authentication.getPrincipal())) {
                return "redirect:/admin";
            }
        }
        if (timeout != null) {
            model.addAttribute("message", "Bạn đã bị đăng xuất do không hoạt động quá lâu.");
        }
        return "login";
    }
}