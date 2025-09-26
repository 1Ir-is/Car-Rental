package com.example.car_rental_admin.controller;

import com.example.car_rental_admin.model.ApprovalApplication;
import com.example.car_rental_admin.service.approval.IApprovalApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin/approval-application")
@RequiredArgsConstructor
public class AdminApprovalApplicationController {
    private final IApprovalApplicationService approvalApplicationService;

    @GetMapping
    public String approvalApplicationsPage(Model model) {
        List<ApprovalApplication> applications = approvalApplicationService.getAllApprovalApplication();
        model.addAttribute("applications", applications);
        model.addAttribute("pendingCount", approvalApplicationService.countPending());
        model.addAttribute("approvedCount", approvalApplicationService.countApproved());
        model.addAttribute("rejectedCount", approvalApplicationService.countRejected());
        model.addAttribute("activeMenu", "applications");
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
