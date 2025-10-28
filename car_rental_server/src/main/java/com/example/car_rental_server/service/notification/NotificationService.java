package com.example.car_rental_server.service.notification;

import com.example.car_rental_server.model.Notification;
import com.example.car_rental_server.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final INotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifyOwnerNewBooking(Long ownerId, String vehicleName, String userName, LocalDate start, LocalDate end) {
        String content = "User " + userName +
                " has booked your vehicle \"" + vehicleName +
                "\" from " + start + " to " + end + ".";
        Notification noti = Notification.builder()
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .type("NEW_BOOKING")
                .url("/owner/vehicles/bookings") // dẫn tới trang quản lý booking
                .senderId(null) // hoặc booking.getUser().getId()
                .recipientId(ownerId) // thông báo cho owner
                .build();

        Notification saved = notificationRepository.save(noti);
        try {
            messagingTemplate.convertAndSend("/topic/notifications-user-" + ownerId, saved);
        } catch (Exception ex) {
            System.err.println("Failed to broadcast booking notification: " + ex.getMessage());
        }
    }

    @Override
    public void notifyOwnerRequest(Long senderId, String userName) {
        Notification noti = Notification.builder()
                .content("User " + userName + " has submitted an owner application.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .type("OWNER_REQUEST")
                .url("/admin/approval-application")
                .senderId(senderId)   // sender = user who requested owner
                .recipientId(null)    // admin/global notification => recipientId left null
                .build();
        Notification saved = notificationRepository.save(noti);

        try {
            messagingTemplate.convertAndSend("/topic/owner-request", saved);
        } catch (Exception ex) {
            System.err.println("Failed to broadcast owner-request notification: " + ex.getMessage());
        }
    }

    @Override
    public void notifyVehicleSubmission(Long senderId, String userName, String vehicleId, String vehicleName) {
        String friendlyName = (vehicleName != null && !vehicleName.isBlank()) ? (" the vehicle \"" + vehicleName + "\"") : " a new vehicle";
        String url = (vehicleId != null && !vehicleId.isBlank()) ? ("/admin/vehicles/" + vehicleId) : "/admin/vehicles";

        Notification noti = Notification.builder()
                .content("Owner " + userName + " has submitted" + friendlyName + " and it is pending review.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .type("VEHICLE_SUBMISSION")
                .url(url)
                .senderId(senderId)  // sender = owner who submitted
                .recipientId(null)   // admin/global notification
                .build();
        Notification saved = notificationRepository.save(noti);

        try {
            messagingTemplate.convertAndSend("/topic/owner-request", saved);
        } catch (Exception ex) {
            System.err.println("Failed to broadcast vehicle-submission on /topic/owner-request: " + ex.getMessage());
        }

        try {
            messagingTemplate.convertAndSend("/topic/vehicle-submitted", saved);
        } catch (Exception ex) {
            System.err.println("Failed to broadcast vehicle-submission on /topic/vehicle-submitted: " + ex.getMessage());
        }
    }

    @Override
    public Notification createNotificationForUser(Long userId, Notification noti) {
        noti.setIsRead(false);
        noti.setCreatedAt(LocalDateTime.now());
        // Set recipientId to the target user (owner)
        noti.setRecipientId(userId);
        // Optionally set senderId to system or leave null
        // noti.setSenderId(systemId or adminId);
        Notification saved = notificationRepository.save(noti);

        // Broadcast realtime to user-specific topic
        try {
            String topic = "/topic/notifications-user-" + userId;
            messagingTemplate.convertAndSend(topic, saved);
        } catch (Exception ex) {
            System.err.println("Failed to broadcast notification to user " + userId + ": " + ex.getMessage());
        }
        return saved;
    }

    @Override
    public List<Notification> getLatestNotificationsForUser(Long userId, int limit) {
        PageRequest page = PageRequest.of(0, Math.max(1, limit));
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, page).getContent();
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        noti.setIsRead(true);
        notificationRepository.save(noti);
    }

    @Override
    @Transactional
    public int markAllReadForUser(Long userId) {
        return notificationRepository.markAllReadByRecipientId(userId);
    }

    @Override
    public long countUnreadForUser(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    // keep other utility methods for admin use as needed
}