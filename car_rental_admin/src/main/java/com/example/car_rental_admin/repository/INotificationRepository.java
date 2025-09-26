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
    List<Notification> findTop5ByOrderByCreatedAtDesc();

    long countByIsReadFalse();

    @Transactional
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();
}
