package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.service.dashboard.IDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final IDashboardService dashboardService;

    @GetMapping("/data")
    public Map<String, Object> getDashboardData() {
        // Service trả về Map chứa tổng số xe, booking hôm nay, doanh thu tháng, khách mới, revenue 7 ngày, xe thuê nhiều, activity...
        return dashboardService.getDashboardData();
    }
}