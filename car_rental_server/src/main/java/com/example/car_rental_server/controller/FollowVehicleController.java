package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.PostVehicleDTO;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.service.follow_vehicle.IFollowVehicleService;
import com.example.car_rental_server.service.user.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles/follow")
@RequiredArgsConstructor
public class FollowVehicleController {

    private final IFollowVehicleService followService;
    private final IUserService userService;

    // Follow vehicle
    @PostMapping("/{vehicleId}")
    public ResponseEntity<?> followVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam("userId") Long userId // hoặc lấy từ token
    ) {
        boolean result = followService.followVehicle(userId, vehicleId);
        if (result) return ResponseEntity.ok().body("Followed vehicle successfully");
        else return ResponseEntity.badRequest().body("Already followed or not found");
    }

    // Unfollow vehicle
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<?> unfollowVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam("userId") Long userId
    ) {
        boolean result = followService.unfollowVehicle(userId, vehicleId);
        if (result) return ResponseEntity.ok().body("Unfollowed vehicle successfully");
        else return ResponseEntity.badRequest().body("You haven't followed this vehicle");
    }

    // Check if following
    @GetMapping("/{vehicleId}/is-following")
    public ResponseEntity<?> isFollowing(
            @PathVariable UUID vehicleId,
            @RequestParam("userId") Long userId
    ) {
        boolean result = followService.isFollowing(userId, vehicleId);
        return ResponseEntity.ok(result);
    }

    // Count followers
    @GetMapping("/{vehicleId}/count")
    public ResponseEntity<?> countFollowers(@PathVariable UUID vehicleId) {
        long count = followService.countFollowers(vehicleId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-followed")
    public ResponseEntity<List<PostVehicleDTO>> getFollowedVehicles(Principal principal) {
        Long userId = userService.findIdByEmail(principal.getName());
        return ResponseEntity.ok(followService.getFollowedVehicleDTOs(userId));
    }
}