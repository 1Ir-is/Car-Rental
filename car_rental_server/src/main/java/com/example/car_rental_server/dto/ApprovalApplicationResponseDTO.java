package com.example.car_rental_server.dto;

import com.example.car_rental_server.enums.ApplicationType;
import com.example.car_rental_server.enums.RequestStatus;
import lombok.Data;

@Data
public class ApprovalApplicationResponseDTO {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String identity;
    private String title;
    private String description;
    private ApplicationType type;
    private RequestStatus status;
}