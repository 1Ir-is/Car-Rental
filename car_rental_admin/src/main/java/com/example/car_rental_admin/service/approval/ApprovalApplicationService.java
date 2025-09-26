package com.example.car_rental_admin.service.approval;

import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.model.Notification;
import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.repository.IAdminUserRepository;
import com.example.car_rental_admin.repository.IApprovalApplicationRepository;
import com.example.car_rental_admin.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalApplicationService implements IApprovalApplicationService {
    private final IApprovalApplicationRepository approvalApplicationRepository;
    private final IAdminUserRepository userRepository;
    private final INotificationRepository notificationRepository;

    @Override
    public List<ApprovalApplication> getAllApprovalApplication() {
        return approvalApplicationRepository.findAll();
    }

    @Override
    public long countPending() {
        return approvalApplicationRepository.countByStatus(RequestStatus.PENDING);
    }

    @Override
    public long countApproved() {
        return approvalApplicationRepository.countByStatus(RequestStatus.APPROVED);
    }

    @Override
    public long countRejected() {
        return approvalApplicationRepository.countByStatus(RequestStatus.REJECTED);
    }

    @Override
    public void approveApplication(Long id) {
        ApprovalApplication app = approvalApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (app.getStatus() == RequestStatus.APPROVED) return; // hoặc custom rule
        app.setStatus(RequestStatus.APPROVED);
        approvalApplicationRepository.save(app);
    }

    @Override
    public void rejectApplication(Long id) {
        ApprovalApplication app = approvalApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (app.getStatus() == RequestStatus.REJECTED) return; // hoặc custom rule
        app.setStatus(RequestStatus.REJECTED);
        approvalApplicationRepository.save(app);
    }

    @Override
    public void revokeApplication(Long id) {
        ApprovalApplication app = approvalApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (app.getStatus() != RequestStatus.APPROVED) return; // chỉ revoke khi đã duyệt

        // Thu hồi quyền owner: chuyển role user về USER
        User user = app.getUser();
        if (user != null && user.getRole() != null && !"USER".equals(user.getRole().getName())) {
            user.getRole().setName("USER");
            userRepository.save(user);
        }

        // Xóa đơn luôn khỏi database
        approvalApplicationRepository.delete(app);
    }

    @Override
    public void submitApplication(User user, ApprovalApplication app) {
        // Lưu đơn
        approvalApplicationRepository.save(app);

        // Tạo notification cho admin
        Notification noti = Notification.builder()
                .content("Người dùng " + user.getName() + " vừa gửi đơn trở thành owner.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .type("OWNER_REQUEST")
                .url("/admin/approval-application") // đường link quản lý đơn
                .senderId(user.getId())
                .build();
        notificationRepository.save(noti);
    }
}
