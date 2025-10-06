package com.example.car_rental_admin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nội dung thông báo
    @Column(nullable = false)
    private String content;

    // Đã đọc hay chưa
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    // Thời gian tạo thông báo
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Loại thông báo (ví dụ: OWNER_REQUEST, NEW_USER, BOOKING_ALERT, ...)
    @Column(nullable = false)
    private String type;

    // Đường dẫn (nếu admin click vào thì chuyển sang đâu đó)
    private String url;

    // Gửi cho ai (nếu chỉ để cho admin thì có thể để null hoặc chỉ định userId nếu mở rộng)
    private Long recipientId;

    // Ai là người tạo ra notification? (có thể để null nếu là hệ thống tự động)
    private Long senderId;
}