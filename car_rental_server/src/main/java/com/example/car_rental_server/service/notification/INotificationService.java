package com.example.car_rental_server.service.notification;

import com.example.car_rental_server.model.Notification;

import java.util.List;

public interface INotificationService {
    // existing notifications used by admin flows
    void notifyOwnerRequest(Long senderId, String userName);

    void notifyVehicleSubmission(Long senderId, String userName, String vehicleId, String vehicleName);

    // create notification for a specific user (called by admin backend)
    Notification createNotificationForUser(Long userId, Notification noti);

    // get latest notifications for a specific user, limit controls page size
    List<Notification> getLatestNotificationsForUser(Long userId, int limit);

    // mark a single notification as read
    void markAsRead(Long id);

    // mark all notifications for a user as read, return number updated
    int markAllReadForUser(Long userId);

    // count unread for a user
    long countUnreadForUser(Long userId);
}