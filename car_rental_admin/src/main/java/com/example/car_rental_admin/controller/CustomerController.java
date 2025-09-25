package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.service.customer.ICustomerService;
import com.example.car_rental_admin.service.role.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final ICustomerService customerService;
    private final IRoleService roleService;

    @GetMapping
    public String listUsers(Model model) {
        List<User> customers = customerService.getAllUsers();
        model.addAttribute("customers", customers);
        model.addAttribute("activeMenu", "customers");
        model.addAttribute("roles", roleService.getAllRoles());
        model.addAttribute("statuses", roleService.getAllUserStatuses());
        return "admin/user-list";
    }
}