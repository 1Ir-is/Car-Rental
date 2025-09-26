package com.example.car_rental_admin.service.approval;

import com.example.car_rental_admin.enums.ApplicationType;
import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.repository.IAdminUserRepository;
import com.example.car_rental_admin.repository.IApprovalApplicationRepository;
import com.example.car_rental_admin.repository.INotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

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
    public Page<ApprovalApplication> findApprovalApplications(String status, String type, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<ApprovalApplication> spec = null;

        if (status != null && !status.isEmpty()) {
            // Convert String => Enum
            RequestStatus statusEnum = RequestStatus.valueOf(status);
            Specification<ApprovalApplication> s = (root, query, cb) -> cb.equal(root.get("status"), statusEnum);
            spec = (spec == null) ? s : spec.and(s);
        }
        if (type != null && !type.isEmpty()) {
            // Convert String => Enum
            ApplicationType typeEnum = ApplicationType.valueOf(type);
            Specification<ApprovalApplication> t = (root, query, cb) -> cb.equal(root.get("type"), typeEnum);
            spec = (spec == null) ? t : spec.and(t);
        }
        if (search != null && !search.isEmpty()) {
            String like = "%" + search.toLowerCase() + "%";
            Specification<ApprovalApplication> se = (root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("identity")), like)
            );
            spec = (spec == null) ? se : spec.and(se);
        }

        return approvalApplicationRepository.findAll(spec, pageable);
    }

    @Override
    public List<String> findAllStatuses() {
        return approvalApplicationRepository.findDistinctStatus();
    }

    @Override
    public List<String> findAllTypes() {
        return approvalApplicationRepository.findDistinctType();
    }
}
