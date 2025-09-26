// Dashboard specific JavaScript

// Sample data for demonstration
const dashboardData = {
    revenue: [
        {date: "2025-09-17", amount: 5200000},
        {date: "2025-09-18", amount: 4800000},
        {date: "2025-09-19", amount: 6100000},
        {date: "2025-09-20", amount: 7300000},
        {date: "2025-09-21", amount: 5900000},
        {date: "2025-09-22", amount: 8200000},
        {date: "2025-09-23", amount: 6800000},
    ],
    popularCars: [
        {name: "Toyota Camry", bookings: 45},
        {name: "Honda Civic", bookings: 38},
        {name: "Mazda 3", bookings: 32},
        {name: "Hyundai Elantra", bookings: 28},
        {name: "Kia Cerato", bookings: 24},
    ],
};

// Initialize charts
let revenueChart = null;
let popularCarsChart = null;

function initializeCharts() {
    initRevenueChart();
    initPopularCarsChart();
}

// Revenue Chart
function initRevenueChart() {
    const ctx = document.getElementById("revenueChart");
    if (!ctx) return;

    // Destroy existing chart if exists
    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dashboardData.revenue.map((item) =>
                new Date(item.date).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                })
            ),
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: dashboardData.revenue.map((item) => item.amount),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#f97316",
                    pointBorderColor: "#2563eb",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return (value / 1000000).toFixed(1) + "M";
                        },
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                },
                x: {
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                },
            },
            elements: {
                point: {
                    hoverRadius: 8,
                },
            },
            animation: {
                duration: 1000,
            },
        },
    });
}

// Popular Cars Chart
function initPopularCarsChart() {
    const ctx = document.getElementById("popularCarsChart");
    if (!ctx) return;

    // Destroy existing chart if exists
    if (popularCarsChart) {
        popularCarsChart.destroy();
    }

    popularCarsChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: dashboardData.popularCars.map((car) => car.name),
            datasets: [
                {
                    data: dashboardData.popularCars.map((car) => car.bookings),
                    backgroundColor: [
                        "#2563eb",
                        "#f97316",
                        "#059669",
                        "#dc2626",
                        "#8b5cf6",
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: "#ffffff",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                        },
                    },
                },
            },
            cutout: "60%",
            animation: {
                duration: 1000,
            },
        },
    });
}

// Update statistics
function updateStats() {
    // Simulate real-time data updates
    const stats = {
        totalCars: Math.floor(Math.random() * 5) + 22,
        todayBookings: Math.floor(Math.random() * 3) + 6,
        monthRevenue: Math.random() * 10000000 + 40000000,
        newCustomers: Math.floor(Math.random() * 8) + 8,
    };

    // Update DOM elements
    const statElements = document.querySelectorAll(".stat-number");
    if (statElements[0]) statElements[0].textContent = stats.totalCars;
    if (statElements[1]) statElements[1].textContent = stats.todayBookings;
    if (statElements[2])
        statElements[2].textContent = formatCurrency(stats.monthRevenue);
    if (statElements[3]) statElements[3].textContent = stats.newCustomers;
}

// Generate report
function generateReport() {
    showNotification("Đang tạo báo cáo...", "info");

    // Simulate report generation
    setTimeout(() => {
        const reportData = {
            generatedAt: new Date().toISOString(),
            totalRevenue: 45250000,
            totalBookings: 156,
            totalCars: 24,
            averageBookingValue: 290000,
        };

        // Create downloadable report
        const reportContent = `
Báo cáo doanh thu - ${formatDate(new Date())}
=======================================

Tổng doanh thu: ${formatCurrency(reportData.totalRevenue)}
Tổng số đặt xe: ${reportData.totalBookings}
Tổng số xe: ${reportData.totalCars}
Giá trị đặt xe trung bình: ${formatCurrency(reportData.averageBookingValue)}

Báo cáo được tạo lúc: ${formatTime(new Date())}
        `;

        const blob = new Blob([reportContent], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-${new Date().toISOString().split("T")[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification("Báo cáo đã được tải xuống thành công!", "success");
    }, 2000);
}


// Refresh dashboard data
function refreshDashboard() {
    showNotification("Đang cập nhật dữ liệu...", "info");

    // Simulate data refresh
    setTimeout(() => {
        updateStats();
        showNotification("Dữ liệu đã được cập nhật!", "success");
    }, 1500);
}

// Auto refresh dashboard every 5 minutes
function startAutoRefresh() {
    setInterval(() => {
        updateStats();
    }, 5 * 60 * 1000); // 5 minutes
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", function () {
    // Initialize charts only once
    if (!revenueChart && !popularCarsChart) {
        initializeCharts();
    }


    // Start auto refresh (chỉ update data, không tạo lại chart)
    startAutoRefresh();

    // Add event listeners
    const notificationBtn = document.querySelector(".notification-btn");
    if (notificationBtn) {
        notificationBtn.addEventListener("click", function () {
            // Show notifications dropdown (implement as needed)
            showNotification("Tính năng thông báo sẽ được triển khai sớm!", "info");
        });
    }
});

// Export dashboard functions for global access
window.generateReport = generateReport;
window.refreshDashboard = refreshDashboard;
