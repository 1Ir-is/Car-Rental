package com.example.car_rental_admin.service.dashboard;

import com.example.car_rental_admin.repository.IAdminUserRepository;
import com.example.car_rental_admin.repository.IBookingRepository;
import com.example.car_rental_admin.repository.IPostVehicleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService implements IDashboardService {

    private final IPostVehicleRepository vehicleRepo;
    private final IBookingRepository bookingRepo;
    private final IAdminUserRepository userRepo;

    @Override
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();

        // Tổng số xe
        long totalVehicles = vehicleRepo.count();

        // Booking hôm nay
        long todayBookings = bookingRepo.countByStartDate(LocalDate.now());

        // Doanh thu tháng
        YearMonth currentMonth = YearMonth.now();
        double monthlyRevenue = bookingRepo.findAll().stream()
                .filter(b -> b.getBookingDate() != null &&
                        YearMonth.from(b.getBookingDate()).equals(currentMonth))
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();

        // Khách mới trong tuần
        LocalDate startOfWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        long newCustomers = userRepo.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(startOfWeek))
                .count();

        // 7-day revenue (for chart)
        List<Map<String, Object>> revenueStats = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            double amount = bookingRepo.findAll().stream()
                    .filter(b -> b.getBookingDate() != null && b.getBookingDate().toLocalDate().equals(date))
                    .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                    .sum();
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toString());
            item.put("amount", amount);
            revenueStats.add(item);
        }

        // Most rented vehicles (for chart)
        Map<UUID, Long> vehicleBookingCount = bookingRepo.findAll().stream()
                .filter(b -> b.getVehicle() != null)
                .collect(Collectors.groupingBy(b -> b.getVehicle().getId(), Collectors.counting()));
        List<Map<String, Object>> popularCars = vehicleBookingCount.entrySet().stream()
                .sorted(Map.Entry.<UUID, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> car = new HashMap<>();
                    car.put("name", vehicleRepo.findById(e.getKey()).map(v -> v.getVehicleName()).orElse("Unknown"));
                    car.put("bookings", e.getValue());
                    return car;
                })
                .collect(Collectors.toList());

        // Recent activities (simple demo)
        List<Map<String, Object>> recentActivities = bookingRepo.findAll().stream()
                .sorted(Comparator.comparing(b -> b.getBookingDate(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(b -> {
                    Map<String, Object> act = new HashMap<>();
                    act.put("icon", b.getStatus() != null && b.getStatus().name().equals("COMPLETED") ? "fas fa-check-circle"
                            : b.getStatus() != null && b.getStatus().name().equals("PENDING") ? "fas fa-plus-circle"
                            : "fas fa-calendar-check");
                    act.put("content", b.getUser().getName() + " booked " + (b.getVehicle() != null ? b.getVehicle().getVehicleName() : "a car"));
                    act.put("time", b.getBookingDate() != null ? b.getBookingDate().toLocalTime().toString() : "");
                    act.put("statusText", b.getStatus() != null ? b.getStatus().name() : "");
                    act.put("statusClass", b.getStatus() != null ? b.getStatus().name().toLowerCase() : "");
                    return act;
                })
                .collect(Collectors.toList());

        data.put("totalVehicles", totalVehicles);
        data.put("todayBookings", todayBookings);
        data.put("monthlyRevenue", monthlyRevenue);
        data.put("newCustomers", newCustomers);
        data.put("revenueStats", revenueStats);
        data.put("popularCars", popularCars);
        data.put("recentActivities", recentActivities);

        return data;
    }
}