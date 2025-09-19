package com.example.car_rental_server.dto;


import com.example.car_rental_server.enums.ApplicationType;
import lombok.Data;

@Data
public class ApprovalApplicationRequestDTO {
    private String name;
    private String phone;
    private String email;
    private String address;
    private String identity;
    private String title;
    private String description;
    private ApplicationType type; // PERSONAL or BUSINESS
}