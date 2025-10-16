package com.example.car_rental_admin.enums;

public enum VehicleStatus {
    PENDING,      // Chờ duyệt admin
    AVAILABLE,    // Đã duyệt, sẵn sàng cho thuê
    RENTED,       // Đang được thuê
    MAINTENANCE,  // Đang bảo trì
    UNAVAILABLE,  // Không hoạt động/tạm ngưng
    REJECTED      // Xe bị từ chối bởi admin
}