package com.example.car_rental_server.dto;

import lombok.Data;

@Data
public class VerifyOtpRequestDTO {
    private String email;
    private String otp;
}
