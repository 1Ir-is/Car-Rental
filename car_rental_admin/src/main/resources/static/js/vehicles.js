// Vehicles management JavaScript - Simplified for static HTML

// Static vehicle data (for reference only)
const vehiclesData = [
    {
        id: 1,
        brand: "Toyota",
        name: "Camry 2024",
        licensePlate: "43A-12345",
        status: "available",
    },
    {
        id: 2,
        brand: "Honda",
        name: "Civic 2023",
        licensePlate: "43A-67890",
        status: "rented",
    },
    {
        id: 3,
        brand: "Mazda",
        name: "CX-5 2024",
        licensePlate: "43A-11111",
        status: "available",
    },
    {
        id: 4,
        brand: "BMW",
        name: "X5 2023",
        licensePlate: "43A-99999",
        status: "maintenance",
    },
    {
        id: 5,
        brand: "Mercedes",
        name: "C-Class 2024",
        licensePlate: "43A-55555",
        status: "available",
    },
    {
        id: 6,
        brand: "Hyundai",
        name: "Elantra 2023",
        licensePlate: "43A-33333",
        status: "available",
    },
];

// Initialize vehicles page
document.addEventListener("DOMContentLoaded", function () {
    // Page is ready - all data is static in HTML
    console.log("Vehicles page loaded with static data");
});

// Search vehicles (basic functionality for demo)
function searchVehicles() {
    const searchTerm = document
        .getElementById("vehicle-search")
        .value.toLowerCase();
    showToast(`Search for: "${searchTerm}"`, "info");
}

// Filter vehicles (basic functionality for demo)
function filterVehicles() {
    const brandFilter = document.getElementById("brand-filter").value;
    const statusFilter = document.getElementById("status-filter").value;

    let message = "Filters applied:";
    if (brandFilter) message += ` Brand: ${brandFilter}`;
    if (statusFilter) message += ` Status: ${statusFilter}`;

    showToast(message, "info");
}

// Refresh table
function refreshTable() {
    const refreshBtn = document.querySelector(".table-actions .btn-outline");
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;

    setTimeout(() => {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshBtn.disabled = false;
        showToast("Table refreshed successfully!", "success");
    }, 1000);
}

// Open add vehicle modal
function openAddVehicleModal() {
    showToast("Add vehicle modal will be available soon!", "info");
}

// Add new vehicle
function addVehicle(event) {
    event.preventDefault();
    showToast("Add vehicle functionality will be available soon!", "info");
}

// View vehicle details
function viewVehicle(vehicleId) {
    // Redirect to vehicle detail page
    window.location.href = `vehicle-detail.html?id=${vehicleId}`;
}

// Edit vehicle
function editVehicle(vehicleId) {
    const vehicle = vehiclesData.find((v) => v.id === vehicleId);
    if (vehicle) {
        showToast(
            `Edit ${vehicle.brand} ${vehicle.name} - Feature coming soon!`,
            "info"
        );
    }
}

// Delete vehicle
function deleteVehicle(vehicleId) {
    const vehicle = vehiclesData.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    if (
        confirm(`Are you sure you want to delete ${vehicle.brand} ${vehicle.name}?`)
    ) {
        showToast(
            `${vehicle.brand} ${vehicle.name} deleted successfully!`,
            "success"
        );

        // In a real app, you would remove the row from DOM or reload the page
        setTimeout(() => {
            showToast("Page would reload in a real application", "info");
        }, 2000);
    }
}

// Export vehicles to Excel
function exportVehicles() {
    showToast("Exporting data...", "info");

    setTimeout(() => {
        const exportData = vehiclesData.map((vehicle) => ({
            Brand: vehicle.brand,
            Model: vehicle.name,
            "License Plate": vehicle.licensePlate,
            Status: vehicle.status,
        }));

        // Simple CSV export
        const csv = [
            Object.keys(exportData[0]).join(","),
            ...exportData.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vehicles-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showToast("Data exported successfully!", "success");
    }, 1500);
}

// Simple toast notification function
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
      .toast.success { background: #10b981; }
      .toast.error { background: #ef4444; }
      .toast.info { background: #3b82f6; }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
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

// Global functions for HTML onclick events
window.searchVehicles = searchVehicles;
window.filterVehicles = filterVehicles;
window.refreshTable = refreshTable;
window.openAddVehicleModal = openAddVehicleModal;
window.addVehicle = addVehicle;
window.viewVehicle = viewVehicle;
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.exportVehicles = exportVehicles;
