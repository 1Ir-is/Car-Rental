package com.example.car_rental_admin.service.customer;

import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.repository.IAdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {
    private final IAdminUserRepository userRepository;

    @Override
    public long countAll() {
        return userRepository.countByRole_NameNot("ADMIN");
    }

    @Override
    public long countByStatus(boolean status) {
        return userRepository.countByStatusAndRole_NameNot(status, "ADMIN");
    }

    @Override
    public long countNewUsersThisMonth() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();
        return userRepository.countByCreatedAtBetweenAndRole_NameNot(start, end, "ADMIN");
    }

    @Override
    public Page<User> searchUsers(String search, String role, String status, Pageable pageable) {
        String excludeRole = "ADMIN";
        Boolean statusValue = null;
        boolean statusFiltered = false;
        boolean roleFiltered = false;

        // Nếu status là ACTIVE hoặc INACTIVE thì filter, ngược lại thì không
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            statusValue = "ACTIVE".equalsIgnoreCase(status);
            statusFiltered = true;
        }

        // Nếu role là "ALL" hoặc rỗng thì không filter role
        if (role != null && !role.isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            roleFiltered = true;
        }

        // search + role + status
        if ((search != null && !search.isBlank()) && roleFiltered && statusFiltered) {
            return userRepository.findByNameContainingIgnoreCaseAndRole_NameAndStatusAndRole_NameNot(
                    search, role, statusValue, excludeRole, pageable);
        }
        // role + status
        else if (roleFiltered && statusFiltered) {
            return userRepository.findByRole_NameAndStatusAndRole_NameNot(
                    role, statusValue, excludeRole, pageable);
        }
        // chỉ role
        else if (roleFiltered) {
            return userRepository.findByRole_NameAndRole_NameNot(role, excludeRole, pageable);
        }
        // chỉ status
        else if (statusFiltered) {
            return userRepository.findByStatusAndRole_NameNot(statusValue, excludeRole, pageable);
        }
        // chỉ search
        else if (search != null && !search.isBlank()) {
            return userRepository.findByNameContainingIgnoreCaseAndRole_NameNot(search, excludeRole, pageable);
        }
        // tất cả user (trừ ADMIN)
        else {
            return userRepository.findByRole_NameNot(excludeRole, pageable);
        }
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public void blockUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(false); // Block user
        userRepository.save(user);
    }

    public void unblockUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(true); // Unblock user
        userRepository.save(user);
    }
}