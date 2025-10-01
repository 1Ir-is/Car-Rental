package com.example.car_rental_admin.service.approval;

import com.example.car_rental_admin.enums.ApplicationType;
import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.model.Role;
import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.repository.IAdminUserRepository;
import com.example.car_rental_admin.repository.IApprovalApplicationRepository;
import com.example.car_rental_admin.repository.IRoleRepository;
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
    private final IRoleRepository roleRepository;

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
        if (app.getStatus() == RequestStatus.APPROVED) return;

        app.setStatus(RequestStatus.APPROVED);

        User user = app.getUser();
        if (user != null) {
            // Lấy role OWNER từ db
            Role ownerRole = roleRepository.findByName("OWNER")
                    .orElseThrow(() -> new RuntimeException("Role OWNER not found"));
            // Gán role mới cho user
            user.setRole(ownerRole);
            userRepository.save(user);
        }

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

        // Thu hồi quyền owner: đổi role_id user về USER
        User user = app.getUser();
        if (user != null && user.getRole() != null && !"USER".equals(user.getRole().getName())) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Role USER not found"));
            user.setRole(userRole); // đổi role_id về 2
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
