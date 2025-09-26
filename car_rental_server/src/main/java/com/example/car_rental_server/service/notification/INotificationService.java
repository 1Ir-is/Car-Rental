package com.example.car_rental_server.service.notification;

public interface INotificationService {
    void notifyOwnerRequest(Long senderId, String userName);
}
