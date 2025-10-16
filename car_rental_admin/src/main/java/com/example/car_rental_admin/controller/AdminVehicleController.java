package com.example.car_rental_admin.controller;


import com.example.car_rental_admin.enums.VehicleStatus;
import com.example.car_rental_admin.model.PostVehicle;
import com.example.car_rental_admin.service.vehicle.IPostVehicleAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/admin/vehicles")
@RequiredArgsConstructor
public class AdminVehicleController {

    private final IPostVehicleAdminService vehicleAdminService;

    @GetMapping
    public String listVehicles(
            Model model,
            @RequestParam(name = "search", defaultValue = "") String search,
            @RequestParam(name = "brand", defaultValue = "") String brand,
            @RequestParam(name = "status", defaultValue = "") String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "6") int size
    ) {
        Page<PostVehicle> vehiclePage = vehicleAdminService.searchVehicles(search, brand, status, page, size);

        // Thống kê
        long totalVehicles = vehicleAdminService.countTotalVehicles();
        long availableVehicles = vehicleAdminService.countVehiclesByStatus("Available");
        long rentedVehicles = vehicleAdminService.countVehiclesByStatus("Rented");
        long maintenanceVehicles = vehicleAdminService.countVehiclesByStatus("Maintenance");

        model.addAttribute("vehicles", vehiclePage.getContent());
        model.addAttribute("totalPages", vehiclePage.getTotalPages());
        model.addAttribute("currentPage", page + 1);
        model.addAttribute("totalElements", vehiclePage.getTotalElements());
        model.addAttribute("search", search);
        model.addAttribute("brand", brand);
        model.addAttribute("status", status);

        // Thêm thống kê vào model
        model.addAttribute("totalVehicles", totalVehicles);
        model.addAttribute("availableVehicles", availableVehicles);
        model.addAttribute("rentedVehicles", rentedVehicles);
        model.addAttribute("maintenanceVehicles", maintenanceVehicles);

        return "admin/vehicle-list";
    }

    // Xem chi tiết 1 xe
    @GetMapping("/{id}")
    public String vehicleDetail(@PathVariable("id") String id, Model model) {
        try {
            UUID uuid = UUID.fromString(id);
            PostVehicle vehicle = vehicleAdminService.findVehicleById(uuid).orElse(null);
            if (vehicle == null) {
                return "redirect:/admin/vehicles?error=notfound";
            }
            model.addAttribute("vehicle", vehicle);
            return "admin/vehicle-detail";
        } catch (IllegalArgumentException ex) {
            // Nếu không phải UUID hợp lệ, trả về thông báo lỗi
            model.addAttribute("error", "Invalid vehicle ID format");
            return "admin/vehicle-detail";
            // Hoặc có thể redirect về list với thông báo lỗi
            // return "redirect:/admin/vehicles?error=format";
        }
    }

    @PostMapping("/{id}/approve")
    public String approveVehicle(@PathVariable("id") String id, Model model) {
        try {
            UUID uuid = UUID.fromString(id);
            boolean result = vehicleAdminService.approveVehicle(uuid);
            if (result) {
                model.addAttribute("success", "Vehicle approved!");
            } else {
                model.addAttribute("error", "Vehicle can only be approved if status is PENDING.");
            }
        } catch (Exception ex) {
            model.addAttribute("error", "Invalid vehicle ID.");
        }
        // Quay lại trang chi tiết xe
        return "redirect:/admin/vehicles/" + id;
    }

    @PostMapping("/{id}/reject")
    public String rejectVehicle(@PathVariable("id") String id,
                                @RequestParam("reason") String reason,
                                Model model) {
        try {
            UUID uuid = UUID.fromString(id);
            boolean result = vehicleAdminService.rejectVehicle(uuid, reason);
            if (result) {
                model.addAttribute("success", "Vehicle rejected!");
            } else {
                model.addAttribute("error", "Vehicle can only be rejected if status is PENDING.");
            }
        } catch (Exception ex) {
            model.addAttribute("error", "Invalid vehicle ID.");
        }
        return "redirect:/admin/vehicles/" + id;
    }

    @PostMapping("/{id}/unavailable")
    public String makeUnavailable(@PathVariable("id") String id,
                                  @RequestParam("reason") String reason,
                                  Model model) {
        try {
            UUID uuid = UUID.fromString(id);
            boolean result = vehicleAdminService.makeUnavailable(uuid, reason);
            if (result) {
                model.addAttribute("success", "Vehicle unavailable!");
            } else {
                model.addAttribute("error", "Vehicle can only be unavailable if status is PENDING.");
            }
        } catch (Exception ex) {
            model.addAttribute("error", "Invalid vehicle ID.");
        }
        return "redirect:/admin/vehicles/" + id;
    }

    @PostMapping("/{id}/status")
    public String updateVehicleStatus(@PathVariable("id") String id,
                                      @RequestParam("status") String status,
                                      @RequestParam(value = "reason", required = false) String reason,
                                      Model model) {
        try {
            UUID uuid = UUID.fromString(id);
            VehicleStatus enumStatus = VehicleStatus.valueOf(status.toUpperCase());
            boolean result = vehicleAdminService.updateVehicleStatus(uuid, enumStatus, reason);
            if (result) {
                model.addAttribute("success", "Vehicle status updated!");
            } else {
                model.addAttribute("error", "Vehicle status update failed.");
            }
        } catch (Exception ex) {
            model.addAttribute("error", "Invalid vehicle ID.");
        }
        return "redirect:/admin/vehicles/" + id;
    }
}