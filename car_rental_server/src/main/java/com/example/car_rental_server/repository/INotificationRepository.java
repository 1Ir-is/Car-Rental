package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Long> {

    // Admin: latest global notifications (no recipient filter)
    List<Notification> findTop5ByOrderByCreatedAtDesc();

    // User-specific: find notifications where recipientId == userId
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // Count unread for a user (by recipientId)
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Mark all read for a given recipient
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :userId")
    int markAllReadByRecipientId(@Param("userId") Long userId);
}