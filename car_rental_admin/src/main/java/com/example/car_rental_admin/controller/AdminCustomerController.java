package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.service.customer.ICustomerService;
import com.example.car_rental_admin.service.notification.INotificationService;
import com.example.car_rental_admin.service.role.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {
    private final ICustomerService customerService;
    private final IRoleService roleService;
    private final INotificationService notificationService;

    @GetMapping
    public String listUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "role", required = false) String role,
            @RequestParam(name = "status", required = false) String status,
            Model model
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> customerPage = customerService.searchUsers(search, role, status, pageable);
        model.addAttribute("customers", customerPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", customerPage.getTotalPages());
        model.addAttribute("totalElements", customerPage.getTotalElements());
        model.addAttribute("search", search);
        model.addAttribute("pageSize", size);
        model.addAttribute("selectedRole", role);
        model.addAttribute("selectedStatus", status);
        model.addAttribute("activeMenu", "customers");
        model.addAttribute("totalUserCount", customerService.countAll());
        model.addAttribute("activeUserCount", customerService.countByStatus(true));
        model.addAttribute("inactiveUserCount", customerService.countByStatus(false));
        model.addAttribute("newUserThisMonth", customerService.countNewUsersThisMonth());
        model.addAttribute("roles", roleService.getAllRoles());
        model.addAttribute("statuses", roleService.getAllUserStatuses());
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());
        return "admin/user-list";
    }

    @GetMapping("/{id}")
    public String viewUserDetail(@PathVariable("id") Long id, Model model) {
        User user = customerService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        model.addAttribute("user", user);
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());
        return "admin/user-detail";
    }

    @PostMapping("/{id}/block")
    public String blockUser(@PathVariable("id") Long id) {
        customerService.blockUserById(id);
        return "redirect:/admin/customers/" + id + "?block=success";
    }

    @PostMapping("/{id}/unblock")
    public String unblockUser(@PathVariable("id") Long id) {
        customerService.unblockUserById(id);
        return "redirect:/admin/customers/" + id + "?unblock=success";
    }
}