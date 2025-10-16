package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.service.vehicle.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;

    @GetMapping("")
    public ResponseEntity<List<PostVehicleDTO>> getAllVehicles() {
        List<PostVehicleDTO> list = vehicleService.getAllVehicles();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(@PathVariable UUID id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}