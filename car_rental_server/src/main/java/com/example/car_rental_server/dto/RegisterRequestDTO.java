package com.example.car_rental_server.dto;

import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String email;
    private String password;
    private String name;
    private String phone;
    private String address;
}