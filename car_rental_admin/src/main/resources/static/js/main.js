// Enhanced main.js with dropdown functionality

// Dropdown functionality
function toggleNotifications() {
    const dropdown = document.getElementById("notificationDropdown");
    const profileDropdown = document.getElementById("profileDropdown");

    // Close profile dropdown if open
    if (profileDropdown && profileDropdown.classList.contains("show")) {
        profileDropdown.classList.remove("show");
        document.querySelector(".profile-trigger").classList.remove("active");
    }

    // Toggle notification dropdown
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    const trigger = document.querySelector(".profile-trigger");
    const notificationDropdown = document.getElementById("notificationDropdown");

    // Close notification dropdown if open
    if (notificationDropdown && notificationDropdown.classList.contains("show")) {
        notificationDropdown.classList.remove("show");
    }

    // Toggle profile dropdown
    if (dropdown && trigger) {
        dropdown.classList.toggle("show");
        trigger.classList.toggle("active");
    }
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (event) {
    const profileDropdown = document.getElementById("profileDropdown");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const profileTrigger = document.querySelector(".profile-trigger");
    const notificationBtn = document.querySelector(".notification-btn");

    // Close profile dropdown if clicked outside
    if (profileDropdown && profileTrigger && !profileTrigger.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("show");
        profileTrigger.classList.remove("active");
    }

    // Close notification dropdown if clicked outside
    if (notificationDropdown && notificationBtn && !notificationBtn.contains(event.target) && !notificationDropdown.contains(event.target)) {
        notificationDropdown.classList.remove("show");
    }
});

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("active");
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const dateOptions = {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    };

    const timeOptions = {
        hour: "2-digit", minute: "2-digit", hour12: false, // 24-hour format
    };

    const dateElement = document.getElementById("current-date");
    const timeElement = document.getElementById("current-time");

    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("en-US", dateOptions);
    }

    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString("en-US", timeOptions);
    }
}

// Logout functionality
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        // Redirect to login page
        window.location.href = "login.html";
    }
}

// Check authentication (optional - currently disabled)
function checkAuth() {
    // You can enable this if you want to force users to go through login
    // const isFromLogin = document.referrer.includes('login.html');
    // if (!isFromLogin && !window.location.pathname.includes('login.html')) {
    //   window.location.href = 'login.html';
    // }
    return true;
}

// Show notification
function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD",
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US");
}

// Format time
function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: false,
    });
}

// Initialize common functionality
document.addEventListener("DOMContentLoaded", function () {
    // Update date/time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize modals
    initializeModals();

    // Authentication check disabled for demo
    // checkAuth();

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", function (event) {
        const sidebar = document.querySelector(".sidebar");
        const sidebarToggle = document.querySelector(".sidebar-toggle");

        if (window.innerWidth <= 1024 && !sidebar.contains(event.target) && !sidebarToggle.contains(event.target) && sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
        }
    });

    // Handle window resize
    window.addEventListener("resize", function () {
        const sidebar = document.querySelector(".sidebar");
        if (window.innerWidth > 1024) {
            sidebar.classList.remove("active");
        }
    });
});

// Table utilities
function sortTable(table, column, direction = "asc") {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
        const aValue = a.cells[column].textContent.trim();
        const bValue = b.cells[column].textContent.trim();

        if (direction === "asc") {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });

    rows.forEach((row) => tbody.appendChild(row));
}

// Search functionality
function searchTable(searchInput, table) {
    const filter = searchInput.value.toLowerCase();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

// Modal utilities
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
}

// Initialize all modals as hidden on page load
function initializeModals() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        modal.classList.remove("show");
    });
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal")) {
        event.target.classList.remove("show");
        document.body.style.overflow = "auto";
    }
});

// Form validation
function validateRequired(form) {
    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            field.classList.add("error");
            isValid = false;
        } else {
            field.classList.remove("error");
        }
    });

    return isValid;
}

// Loading state
function showLoading(element) {
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Export data
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(","));

    return [csvHeaders, ...csvRows].join("\n");
}
