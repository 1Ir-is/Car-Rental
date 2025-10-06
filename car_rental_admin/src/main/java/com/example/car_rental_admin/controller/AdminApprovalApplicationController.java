package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.enums.ApplicationType;
import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.service.MailService;
import com.example.car_rental_admin.service.approval.IApprovalApplicationService;
import com.example.car_rental_admin.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.flogger.Flogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("/admin/approval-application")
@RequiredArgsConstructor
public class AdminApprovalApplicationController {
    private final IApprovalApplicationService approvalApplicationService;
    private final INotificationService notificationService;
    private final MailService mailService;

    private static final Logger logger = LoggerFactory.getLogger(AdminApprovalApplicationController.class);

    @GetMapping
    public String approvalApplicationsPage(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            Model model
    ) {
        Page<ApprovalApplication> appsPage = approvalApplicationService
                .findApprovalApplications(status, type, search, page - 1, size);

        List<RequestStatus> statusList = Arrays.asList(RequestStatus.values());
        List<ApplicationType> typeList = Arrays.asList(ApplicationType.values());

        model.addAttribute("applications", appsPage.getContent());
        model.addAttribute("pendingCount", approvalApplicationService.countPending());
        model.addAttribute("approvedCount", approvalApplicationService.countApproved());
        model.addAttribute("rejectedCount", approvalApplicationService.countRejected());
        model.addAttribute("activeMenu", "applications");
        model.addAttribute("statusList", statusList);
        model.addAttribute("typeList", typeList);

        model.addAttribute("currentPage", page);
        model.addAttribute("size", size);
        model.addAttribute("totalElements", appsPage.getTotalElements());
        model.addAttribute("totalPages", appsPage.getTotalPages());

        model.addAttribute("selectedStatus", status);
        model.addAttribute("selectedType", type);
        model.addAttribute("searchKeyword", search);
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());

        return "admin/approval-applications-list";
    }

    @PostMapping("/approve/{id}")
    public String approveApplication(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        ApprovalApplication app = approvalApplicationService.approveApplication(id);
        User user = app.getUser();
        if (user != null) {
            try {
                mailService.sendApprovedMail(user.getEmail(), user.getName(), "/user/dashboard");
            } catch (Exception e) {
                logger.error("Lỗi gửi mail approve cho user {} - email {}: {}", user.getName(), user.getEmail(), e.getMessage(), e);
                redirectAttributes.addFlashAttribute("mailError", "Gửi email thông báo duyệt đơn cho user không thành công!");
            }
        }
        return "redirect:/admin/approval-application";
    }

    @PostMapping("/reject/{id}")
    public String rejectApplication(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        ApprovalApplication app = approvalApplicationService.rejectApplication(id);
        User user = app.getUser();
        if (user != null) {
            try {
                mailService.sendRejectedMail(user.getEmail(), user.getName(), "/user/dashboard");
            } catch (Exception e) {
                logger.error("Lỗi gửi mail reject cho user {} - email {}: {}", user.getName(), user.getEmail(), e.getMessage(), e);
                redirectAttributes.addFlashAttribute("mailError", "Gửi email thông báo từ chối đơn cho user không thành công!");
            }
        }
        return "redirect:/admin/approval-application";
    }

    @PostMapping("/revoke/{id}")
    public String revokeApplication(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        ApprovalApplication app = approvalApplicationService.revokeApplication(id);
        User user = app.getUser();
        if (user != null) {
            try {
                mailService.sendRevokedMail(user.getEmail(), user.getName(), "/user/dashboard");
            } catch (Exception e) {
                logger.error("Lỗi gửi mail revoke cho user {} - email {}: {}", user.getName(), user.getEmail(), e.getMessage(), e);
                redirectAttributes.addFlashAttribute("mailError", "Gửi email thông báo thu hồi quyền owner cho user không thành công!");
            }
        }
        return "redirect:/admin/approval-application";
    }
}