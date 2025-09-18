package com.example.car_rental_server.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}