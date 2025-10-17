package com.example.car_rental_admin.service.notification;

import com.example.car_rental_admin.model.Notification;
import com.example.car_rental_admin.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {
    private final INotificationRepository notificationRepository;

    /**
     * Return latest global notifications that are intended for admins (recipientId IS NULL).
     */
    @Override
    public List<Notification> getLatestNotifications(int limit) {
        // repository currently fixed to return top5; if you want to pass limit dynamically, add custom query.
        return notificationRepository.findTop5ByRecipientIdIsNullOrderByCreatedAtDesc();
    }

    /**
     * Count unread global notifications (recipientId IS NULL).
     */
    @Override
    public long countUnreadNotifications() {
        return notificationRepository.countByRecipientIdIsNullAndIsReadFalse();
    }

    /**
     * Mark all global notifications as read.
     */
    @Override
    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllGlobalRead();
    }

    @Override
    public Page<Notification> findAllNotifications(int page, int size) {
        // For admin "All notifications" view, you may want to show only global notifications or allow filtering.
        // Current behavior: show all notifications (both global and user-specific) — change if desired.
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findAll(pageable);
    }

    @Override
    public Notification createNotification(Notification noti) {
        noti.setIsRead(false);
        noti.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(noti);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        noti.setIsRead(true);
        notificationRepository.save(noti);
    }
}