package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Long> {

    // Global admin notifications: recipientId IS NULL (or no recipient)
    List<Notification> findTop5ByRecipientIdIsNullOrderByCreatedAtDesc();

    // Count unread global notifications for admin
    long countByRecipientIdIsNullAndIsReadFalse();

    /**
     * Mark all global notifications as read (recipientId IS NULL).
     * Returns number of rows updated.
     */
    @Transactional
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId IS NULL AND n.isRead = false")
    int markAllGlobalRead();
}