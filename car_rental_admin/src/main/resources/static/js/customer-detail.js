// Customer Detail Page JavaScript

// Sample customer data (in real app, this would come from API)
const sampleCustomerData = [
    {
        id: 1,
        name: "Admin",
        full_name: "Admin User",
        username: "admin",
        email: "admin@gmail.com",
        phone: "0900111222",
        phone_number: "0900111222",
        address: "123 Tran Hung Dao, Da Nang",
        date_of_birth: null,
        avatar:
            "https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff",
        status: 1,
        is_active: 1,
        trust_point: 0,
        role_id: 1,
        created_at: "2025-09-18",
        updated_at: "2025-09-18",
    },
    {
        id: 2,
        name: "Huynh Minh Huy",
        full_name: "Huynh Minh Huy",
        username: "huynhminhguy",
        email: "hcmotorcycle@gmail.com",
        phone: "0900111222",
        phone_number: "0900111222",
        address: "Da Nang",
        date_of_birth: null,
        avatar:
            "https://ui-avatars.com/api/?name=Huynh+Minh+Huy&background=10b981&color=fff",
        status: 1,
        is_active: 1,
        trust_point: 0,
        role_id: 2,
        created_at: "2025-09-18",
        updated_at: "2025-09-18",
    },
    {
        id: 3,
        name: "vinh",
        full_name: "vinh",
        username: "vinh",
        email: "vinh@codegym.com",
        phone: "0914048099",
        phone_number: "0914048099",
        address: "Da Nang",
        date_of_birth: "2003-05-10",
        avatar:
            "https://res.cloudinary.com/dnrxavuuu/image/upload/v1726715853/avatar.png",
        status: 1,
        is_active: 1,
        trust_point: 0,
        role_id: 2,
        created_at: "2025-09-19",
        updated_at: "2025-09-19",
    },
    {
        id: 4,
        name: "Michels David",
        full_name: "Michels David",
        username: "michelsdavid",
        email: "huyhk1005@gmail.com",
        phone: "0914048099",
        phone_number: "0914048099",
        address: "Da Nang",
        date_of_birth: null,
        avatar:
            "https://ui-avatars.com/api/?name=Michels+David&background=f59e0b&color=fff",
        status: 1,
        is_active: 1,
        trust_point: 0,
        role_id: 2,
        created_at: "2025-09-19",
        updated_at: "2025-09-19",
    },
];

// Current customer data
let currentCustomer = null;
let currentCustomerId = null;

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Get customer ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentCustomerId = parseInt(urlParams.get("id"));

    if (!currentCustomerId) {
        showErrorState();
        return;
    }

    loadCustomerDetails(currentCustomerId);
});

// Load customer details
function loadCustomerDetails(customerId) {
    showLoadingState();

    // Simulate API call delay
    setTimeout(() => {
        // Find customer in sample data
        currentCustomer = sampleCustomerData.find((c) => c.id === customerId);

        if (!currentCustomer) {
            showErrorState();
            return;
        }

        hideLoadingState();
        renderCustomerDetails(currentCustomer);
    }, 500);
}

// Render customer details
function renderCustomerDetails(customer) {
    // Update breadcrumb
    document.getElementById("breadcrumb-customer-name").textContent =
        customer.full_name || customer.name;

    // Render profile header
    renderProfileHeader(customer);

    // Render info sections
    renderPersonalInfo(customer);
    renderAccountInfo(customer);
    renderContactInfo(customer);
    renderStatistics(customer);
}

// Render profile header
function renderProfileHeader(customer) {
    const container = document.getElementById("customer-profile-header");
    container.innerHTML = `
    <div class="profile-header-content">
      <img src="${customer.avatar}" alt="${
        customer.name
    }" class="profile-avatar">
      <div class="profile-info">
        <h1>${customer.full_name || customer.name}</h1>
        <div class="profile-username">@${customer.username}</div>
        <div class="profile-badges">
          <span class="profile-badge">${getRoleLabel(customer.role_id)}</span>
          <span class="profile-badge">${getStatusLabel(
        customer.is_active
    )}</span>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <span class="profile-stat-value">12</span>
            <span class="profile-stat-label">Total Bookings</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-value">$4,580</span>
            <span class="profile-stat-label">Total Spent</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-value">${customer.trust_point}</span>
            <span class="profile-stat-label">Trust Points</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render personal information
function renderPersonalInfo(customer) {
    const container = document.getElementById("personal-info");
    container.innerHTML = `
    <div class="info-list">
      <div class="info-item">
        <span class="info-label">Full Name</span>
        <span class="info-value">${customer.full_name || customer.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Username</span>
        <span class="info-value">@${customer.username}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Date of Birth</span>
        <span class="info-value">${
        customer.date_of_birth
            ? formatDate(customer.date_of_birth)
            : "Not provided"
    }</span>
      </div>
      <div class="info-item">
        <span class="info-label">Customer ID</span>
        <span class="info-value">#USER${customer.id
        .toString()
        .padStart(3, "0")}</span>
      </div>
    </div>
  `;
}

// Render account information
function renderAccountInfo(customer) {
    const container = document.getElementById("account-info");
    container.innerHTML = `
    <div class="info-list">
      <div class="info-item">
        <span class="info-label">Role</span>
        <span class="info-value">
          <span class="badge badge-role-${customer.role_id}">${getRoleLabel(
        customer.role_id
    )}</span>
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">Status</span>
        <span class="info-value">
          <span class="status-badge ${
        customer.is_active ? "active" : "inactive"
    }">
            ${getStatusLabel(customer.is_active)}
          </span>
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">Trust Points</span>
        <span class="info-value trust-score">
          <i class="fas fa-star"></i>
          ${customer.trust_point} points
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">Member Since</span>
        <span class="info-value">${formatDate(customer.created_at)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Last Updated</span>
        <span class="info-value">${formatDate(customer.updated_at)}</span>
      </div>
    </div>
  `;
}

// Render contact information
function renderContactInfo(customer) {
    const container = document.getElementById("contact-info");
    container.innerHTML = `
    <div class="info-list">
      <div class="info-item">
        <span class="info-label">
          <i class="fas fa-envelope"></i>
          Email
        </span>
        <span class="info-value">${customer.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">
          <i class="fas fa-phone"></i>
          Phone
        </span>
        <span class="info-value">${
        customer.phone_number || customer.phone
    }</span>
      </div>
      <div class="info-item">
        <span class="info-label">
          <i class="fas fa-map-marker-alt"></i>
          Address
        </span>
        <span class="info-value">${customer.address || "Not provided"}</span>
      </div>
    </div>
  `;
}

// Render statistics
function renderStatistics(customer) {
    const container = document.getElementById("statistics-info");
    container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-number">12</span>
        <span class="stat-label">Total Bookings</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">8</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">2</span>
        <span class="stat-label">Active</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">1</span>
        <span class="stat-label">Cancelled</span>
      </div>
    </div>
  `;
}

// Helper functions
function getRoleLabel(role_id) {
    const roleLabels = {
        1: "Admin",
        2: "User",
        3: "Manager",
    };
    return roleLabels[role_id] || "User";
}

function getRoleName(role_id) {
    return getRoleLabel(role_id);
}

function getStatusLabel(is_active) {
    return is_active ? "Active" : "Inactive";
}

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// State management functions
function showLoadingState() {
    document.getElementById("loading-state").style.display = "flex";
    document.querySelector(
        ".customer-detail-content > .breadcrumb"
    ).style.display = "none";
    document.querySelector(
        ".customer-detail-content > .page-header"
    ).style.display = "none";
    document.querySelector(".customer-profile-header").style.display = "none";
    document.querySelector(".customer-details-grid").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

function hideLoadingState() {
    document.getElementById("loading-state").style.display = "none";
    document.querySelector(
        ".customer-detail-content > .breadcrumb"
    ).style.display = "flex";
    document.querySelector(
        ".customer-detail-content > .page-header"
    ).style.display = "block";
    document.querySelector(".customer-profile-header").style.display = "block";
    document.querySelector(".customer-details-grid").style.display = "grid";
}

function showErrorState() {
    document.getElementById("loading-state").style.display = "none";
    document.querySelector(
        ".customer-detail-content > .breadcrumb"
    ).style.display = "none";
    document.querySelector(
        ".customer-detail-content > .page-header"
    ).style.display = "none";
    document.querySelector(".customer-profile-header").style.display = "none";
    document.querySelector(".customer-details-grid").style.display = "none";
    document.getElementById("error-state").style.display = "flex";
}

// Navigation functions
function goBackToCustomers() {
    window.location.href = "customers.html";
}

// Action functions
function editCurrentCustomer() {
    if (!currentCustomer) return;

    // Populate edit form
    document.getElementById("edit-fullName").value =
        currentCustomer.full_name || currentCustomer.name;
    document.getElementById("edit-username").value =
        currentCustomer.username || "";
    document.getElementById("edit-phone").value =
        currentCustomer.phone_number || currentCustomer.phone;
    document.getElementById("edit-email").value = currentCustomer.email || "";
    document.getElementById("edit-address").value = currentCustomer.address || "";
    document.getElementById("edit-role").value = currentCustomer.role_id || 2;

    if (currentCustomer.date_of_birth) {
        document.getElementById("edit-birthDate").value =
            currentCustomer.date_of_birth;
    }

    // Store customer ID for update
    document
        .getElementById("edit-customer-form")
        .setAttribute("data-customer-id", currentCustomer.id);

    openModal("edit-customer-modal");
}

function deleteCurrentCustomer() {
    if (!currentCustomer) return;

    const confirmMessage = `Are you sure you want to delete user "${
        currentCustomer.full_name || currentCustomer.name
    }" (@${currentCustomer.username})?`;

    if (confirm(confirmMessage)) {
        // In real app, this would be an API call
        showToast(
            `User "${
                currentCustomer.full_name || currentCustomer.name
            }" deleted successfully!`,
            "success"
        );

        // Redirect back to customers page after short delay
        setTimeout(() => {
            goBackToCustomers();
        }, 1500);
    }
}

function updateCustomer(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Update current customer data
    currentCustomer.full_name = formData.get("fullName");
    currentCustomer.name = formData.get("fullName");
    currentCustomer.username =
        formData.get("username") || currentCustomer.username;
    currentCustomer.phone = formData.get("phone");
    currentCustomer.phone_number = formData.get("phone");
    currentCustomer.email = formData.get("email") || "";
    currentCustomer.address = formData.get("address") || "";
    currentCustomer.date_of_birth = formData.get("birthDate") || null;
    currentCustomer.role_id = parseInt(formData.get("role")) || 2;
    currentCustomer.updated_at = new Date().toISOString().split("T")[0];

    // Re-render the page with updated data
    renderCustomerDetails(currentCustomer);

    closeModal("edit-customer-modal");
    showToast("Customer updated successfully!", "success");
}

// Toast notification function
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast styles if not already added
    if (!document.querySelector("style[data-toast-styles]")) {
        const style = document.createElement("style");
        style.setAttribute("data-toast-styles", "true");
        style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
      }
      .toast.success {
        background: #10b981;
      }
      .toast.error {
        background: #ef4444;
      }
      .toast.info {
        background: #3b82f6;
      }
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideInRight 0.3s ease reverse";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Quick Action functions
function callCustomer() {
    if (!currentCustomer) return;

    const phone = currentCustomer.phone_number || currentCustomer.phone;
    if (phone) {
        window.open(`tel:${phone}`);
        showToast(
            `Calling ${currentCustomer.full_name || currentCustomer.name}...`,
            "info"
        );
    } else {
        showToast("No phone number available", "error");
    }
}

function emailCustomer() {
    if (!currentCustomer) return;

    if (currentCustomer.email) {
        const subject = encodeURIComponent(`Regarding your Auto Rent account`);
        const body = encodeURIComponent(
            `Dear ${currentCustomer.full_name || currentCustomer.name},\n\n`
        );
        window.open(
            `mailto:${currentCustomer.email}?subject=${subject}&body=${body}`
        );
        showToast(`Opening email to ${currentCustomer.email}`, "info");
    } else {
        showToast("No email address available", "error");
    }
}

function viewBookings() {
    if (!currentCustomer) return;

    // In real app, this would navigate to bookings page with customer filter
    showToast("Redirecting to bookings page...", "info");
    setTimeout(() => {
        window.location.href = `bookings.html?customer=${currentCustomer.id}`;
    }, 1000);
}

function addNote() {
    if (!currentCustomer) return;

    const note = prompt(
        `Add a note for ${currentCustomer.full_name || currentCustomer.name}:`
    );
    if (note?.trim()) {
        showToast("Note added successfully!", "success");
        // In real app, this would save to database
    }
}

function blockCustomer() {
    if (!currentCustomer) return;

    const confirmMessage = `Are you sure you want to block ${
        currentCustomer.full_name || currentCustomer.name
    }? This will prevent them from making new bookings.`;

    if (confirm(confirmMessage)) {
        currentCustomer.is_active = 0;
        renderCustomerDetails(currentCustomer);
        showToast(
            `${currentCustomer.full_name || currentCustomer.name} has been blocked`,
            "success"
        );
    }
}

function resetPassword() {
    if (!currentCustomer) return;

    const confirmMessage = `Send password reset email to ${currentCustomer.email}?`;

    if (confirm(confirmMessage)) {
        showToast("Password reset email sent!", "success");
        // In real app, this would call API to send reset email
    }
}

function copyContact() {
    if (!currentCustomer) return;

    const contactInfo = `
Name: ${currentCustomer.full_name || currentCustomer.name}
Email: ${currentCustomer.email}
Phone: ${currentCustomer.phone_number || currentCustomer.phone}
Address: ${currentCustomer.address || "Not provided"}
  `.trim();

    navigator.clipboard
        .writeText(contactInfo)
        .then(() => {
            showToast("Contact information copied to clipboard!", "success");
        })
        .catch(() => {
            showToast("Failed to copy contact information", "error");
        });
}

function viewDetailedStats() {
    if (!currentCustomer) return;

    showToast("Opening detailed statistics...", "info");
    // In real app, this would open a detailed stats modal or page
}

// Export functions to global scope
window.goBackToCustomers = goBackToCustomers;
window.editCurrentCustomer = editCurrentCustomer;
window.deleteCurrentCustomer = deleteCurrentCustomer;
window.updateCustomer = updateCustomer;
window.callCustomer = callCustomer;
window.emailCustomer = emailCustomer;
window.viewBookings = viewBookings;
window.addNote = addNote;
window.blockCustomer = blockCustomer;
window.resetPassword = resetPassword;
window.copyContact = copyContact;
window.viewDetailedStats = viewDetailedStats;
