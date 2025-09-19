package com.example.car_rental_server.dto;

import com.example.car_rental_server.model.Role;
import com.example.car_rental_server.model.User;
import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String avatar;
    private Boolean status;
    private Double trustPoint;
    private Role role;
    private String createdAt;
    private Boolean enabled;

    public static UserProfileDTO from(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setAvatar(user.getAvatar());
        dto.setStatus(user.getStatus());
        dto.setTrustPoint(user.getTrustPoint());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        dto.setEnabled(user.isEnabled());
        return dto;
    }
}