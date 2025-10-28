package com.example.car_rental_admin.controller;


import com.example.car_rental_admin.service.booking.IBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class AdminBookingController {
    private final IBookingService bookingService;

    @GetMapping("/admin/bookings")
    public String bookings(Model model) {
        model.addAttribute("activeMenu", "bookings");
        model.addAttribute("bookings", bookingService.getAllBookings());
        return "admin/bookings"; // Thymeleaf view ở templates/admin/bookings.html
    }
}