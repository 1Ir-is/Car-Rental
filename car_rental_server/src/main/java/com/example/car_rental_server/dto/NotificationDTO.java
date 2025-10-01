package com.example.car_rental_server.dto;

import lombok.Data;

@Data
public class NotificationDTO {
    private String title;
    private String message;
    private String url;
}
