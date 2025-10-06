package com.example.car_rental_admin.service.notification;

import com.example.car_rental_admin.model.Notification;
import org.springframework.data.domain.Page;

import java.util.List;

public interface INotificationService {
    List<Notification> getLatestNotifications(int limit);

    long countUnreadNotifications();

    int markAllAsRead();

    Page<Notification> findAllNotifications(int page, int size);

    Notification createNotification(Notification noti);

    void markAsRead(Long id);
}
