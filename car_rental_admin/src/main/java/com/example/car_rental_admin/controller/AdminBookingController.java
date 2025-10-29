package com.example.car_rental_admin.controller;


import com.example.car_rental_admin.model.Booking;
import com.example.car_rental_admin.service.booking.IBookingService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class AdminBookingController {
    private final IBookingService bookingService;

    @GetMapping("/admin/bookings")
    public String bookings(Model model) {
        List<Booking> bookings = bookingService.getAllBookings();
        long pendingCount = bookings.stream().filter(b -> b.getStatus() != null && b.getStatus().name().equals("PENDING")).count();
        long approvedCount = bookings.stream().filter(b -> b.getStatus() != null && b.getStatus().name().equals("CONFIRMED")).count();
        long completedCount = bookings.stream().filter(b -> b.getStatus() != null && b.getStatus().name().equals("COMPLETED")).count();

        model.addAttribute("activeMenu", "bookings");
        model.addAttribute("bookings", bookings);
        model.addAttribute("pendingCount", pendingCount);
        model.addAttribute("approvedCount", approvedCount);
        model.addAttribute("completedCount", completedCount);

        return "admin/bookings";
    }

    @GetMapping("/admin/bookings/export")
    public void exportBookingsToExcel(HttpServletResponse response) throws IOException {
        List<Booking> bookings = bookingService.getAllBookings();

        // Set response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");

        // Create workbook
        try (var workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            var sheet = workbook.createSheet("Bookings");

            // Create cell style with border
            var borderStyle = workbook.createCellStyle();
            borderStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            borderStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            borderStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            borderStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);

            // Header
            var header = sheet.createRow(0);
            String[] columns = { "Customer", "Owner", "Car", "Start", "End", "Status", "Total", "Date" };
            for (int i = 0; i < columns.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(borderStyle); // Apply border to header
            }

            // Data rows
            int rowIdx = 1;
            for (Booking b : bookings) {
                var row = sheet.createRow(rowIdx++);
                var cell0 = row.createCell(0); cell0.setCellValue(b.getUser().getName()); cell0.setCellStyle(borderStyle);
                var cell1 = row.createCell(1); cell1.setCellValue(b.getOwner().getName()); cell1.setCellStyle(borderStyle);
                var cell2 = row.createCell(2); cell2.setCellValue(b.getVehicle().getVehicleName()); cell2.setCellStyle(borderStyle);
                var cell3 = row.createCell(3); cell3.setCellValue(b.getStartDate().toString()); cell3.setCellStyle(borderStyle);
                var cell4 = row.createCell(4); cell4.setCellValue(b.getEndDate().toString()); cell4.setCellStyle(borderStyle);
                var cell5 = row.createCell(5); cell5.setCellValue(b.getStatus() != null ? b.getStatus().name() : ""); cell5.setCellStyle(borderStyle);
                var cell6 = row.createCell(6); cell6.setCellValue(b.getTotalAmount() != null ? b.getTotalAmount() : 0); cell6.setCellStyle(borderStyle);
                var cell7 = row.createCell(7); cell7.setCellValue(b.getBookingDate() != null ?
                        b.getBookingDate().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : ""); cell7.setCellStyle(borderStyle);
            }

            // Optional: Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }
}