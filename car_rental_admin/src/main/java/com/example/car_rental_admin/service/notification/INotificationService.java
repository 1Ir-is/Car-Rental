package com.example.car_rental_admin.service.notification;

import com.example.car_rental_admin.model.Notification;

import java.util.List;

public interface INotificationService {
    List<Notification> getLatestNotifications(int limit);

    long countUnreadNotifications();

    int markAllAsRead();
}
