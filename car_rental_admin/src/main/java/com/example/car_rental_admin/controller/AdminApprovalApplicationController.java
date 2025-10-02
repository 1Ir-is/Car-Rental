package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.enums.ApplicationType;
import com.example.car_rental_admin.enums.RequestStatus;
import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.service.approval.IApprovalApplicationService;
import com.example.car_rental_admin.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;


@Controller
@RequestMapping("/admin/approval-application")
@RequiredArgsConstructor
public class AdminApprovalApplicationController {
    private final IApprovalApplicationService approvalApplicationService;
    private final INotificationService notificationService;

    @GetMapping
    public String approvalApplicationsPage(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            Model model
    ) {
        // Lấy page ứng với bộ lọc
        Page<ApprovalApplication> appsPage = approvalApplicationService
                .findApprovalApplications(status, type, search, page - 1, size);

        // Lấy đủ giá trị enum cho dropdown filter
        List<RequestStatus> statusList = Arrays.asList(RequestStatus.values());
        List<ApplicationType> typeList = Arrays.asList(ApplicationType.values());

        model.addAttribute("applications", appsPage.getContent());
        model.addAttribute("pendingCount", approvalApplicationService.countPending());
        model.addAttribute("approvedCount", approvalApplicationService.countApproved());
        model.addAttribute("rejectedCount", approvalApplicationService.countRejected());
        model.addAttribute("activeMenu", "applications");
        model.addAttribute("statusList", statusList);
        model.addAttribute("typeList", typeList);

        // Để phân trang
        model.addAttribute("currentPage", page);
        model.addAttribute("size", size);
        model.addAttribute("totalElements", appsPage.getTotalElements());
        model.addAttribute("totalPages", appsPage.getTotalPages());

        // Để giữ lại filter khi chuyển trang
        model.addAttribute("selectedStatus", status);
        model.addAttribute("selectedType", type);
        model.addAttribute("searchKeyword", search);
        model.addAttribute("notifications", notificationService.getLatestNotifications(5));
        model.addAttribute("unreadNotificationCount", notificationService.countUnreadNotifications());

        return "admin/approval-applications-list";
    }


    // Approve 1 đơn
    @PostMapping("/approve/{id}")
    public String approveApplication(@PathVariable Long id) {
        approvalApplicationService.approveApplication(id);
        return "redirect:/admin/approval-application";
    }

    // Reject 1 đơn
    @PostMapping("/reject/{id}")
    public String rejectApplication(@PathVariable Long id) {
        approvalApplicationService.rejectApplication(id);
        return "redirect:/admin/approval-application";
    }

    // Thu hồi
    @PostMapping("/revoke/{id}")
    public String revokeApplication(@PathVariable Long id) {
        approvalApplicationService.revokeApplication(id);
        return "redirect:/admin/approval-application";
    }
}
