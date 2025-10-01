package com.example.car_rental_admin.service.notification;

import com.example.car_rental_admin.model.Notification;
import com.example.car_rental_admin.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {
    private final INotificationRepository notificationRepository;

    public List<Notification> getLatestNotifications(int limit) {
        return notificationRepository.findTop5ByOrderByCreatedAtDesc();
    }

    public long countUnreadNotifications() {
        return notificationRepository.countByIsReadFalse();
    }

    @Override
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead();
    }

    @Override
    public Page<Notification> findAllNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findAll(pageable);
    }
}