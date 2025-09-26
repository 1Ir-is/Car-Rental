package com.example.car_rental_server.service.notification;

import com.example.car_rental_server.model.Notification;
import com.example.car_rental_server.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final INotificationRepository notificationRepository;

    @Override
    public void notifyOwnerRequest(Long senderId, String userName) {
        Notification noti = Notification.builder()
                .content("Người dùng " + userName + " vừa gửi đơn trở thành owner.")
                .isRead(false)
                .createdAt(java.time.LocalDateTime.now())
                .type("OWNER_REQUEST")
                .url("/admin/approval-application")
                .senderId(senderId)
                .build();
        notificationRepository.save(noti);
    }
}
