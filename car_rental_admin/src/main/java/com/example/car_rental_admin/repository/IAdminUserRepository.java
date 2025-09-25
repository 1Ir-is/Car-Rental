package com.example.car_rental_admin.repository;

import com.example.car_rental_admin.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IAdminUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.name <> 'ADMIN'")
    List<User> findAllUsers();

    // Đếm tất cả user KHÔNG PHẢI ADMIN
    long countByRole_NameNot(String roleName);

    // Đếm user theo status và KHÔNG PHẢI ADMIN
    long countByStatusAndRole_NameNot(Boolean status, String roleName);

    // Đếm user tạo mới trong tháng này và KHÔNG PHẢI ADMIN
    long countByCreatedAtBetweenAndRole_NameNot(LocalDate start, LocalDate end, String roleName);

    Page<User> findByNameContainingIgnoreCaseAndRole_NameNot(String name, String excludeRole, Pageable pageable);

    Page<User> findByRole_NameNot(String excludeRole, Pageable pageable);

    Page<User> findByNameContainingIgnoreCaseAndRole_NameAndStatusAndRole_NameNot(
            String name, String role, Boolean status, String excludeRole, Pageable pageable);

    Page<User> findByRole_NameAndStatusAndRole_NameNot(
            String role, Boolean status, String excludeRole, Pageable pageable);

    Page<User> findByRole_NameAndRole_NameNot(
            String role, String excludeRole, Pageable pageable);

    Page<User> findByStatusAndRole_NameNot(
            Boolean status, String excludeRole, Pageable pageable);
}