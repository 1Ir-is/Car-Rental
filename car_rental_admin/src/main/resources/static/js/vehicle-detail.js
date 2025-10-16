// Vehicle Detail Page JavaScript

// Current vehicle data (for reference only)
let currentVehicle = {
    id: 1,
    brand: "Toyota",
    name: "Camry 2024",
    licensePlate: "43A-12345",
    year: 2024,
    dailyRate: 85,
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    status: "available",
    totalBookings: 15,
};

// Image Gallery Variables
let currentSlide = 0;
let totalSlides = 6;
let autoSlideInterval;

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Set initial status selector value
    const statusSelector = document.getElementById("vehicle-status-selector");
    if (statusSelector && currentVehicle) {
        statusSelector.value = currentVehicle.status;
    }

    // Initialize image gallery
    initializeImageGallery();
});

// Image Gallery Functions
function initializeImageGallery() {
    // Update total slides count
    const slides = document.querySelectorAll(".slide");
    totalSlides = slides.length;

    // Update counter
    updateImageCounter();

    // Start auto-slide (optional)
    startAutoSlide();

    // Add keyboard navigation
    document.addEventListener("keydown", handleKeyboardNavigation);

    // Add touch/swipe support for mobile
    addTouchSupport();
}

function changeSlide(direction) {
    const slides = document.querySelectorAll(".slide");
    const thumbnails = document.querySelectorAll(".thumbnail");

    // Remove active class from current slide and thumbnail
    slides[currentSlide].classList.remove("active");
    thumbnails[currentSlide].classList.remove("active");

    // Calculate new slide index
    currentSlide += direction;

    // Handle wrap-around
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }

    // Add active class to new slide and thumbnail
    slides[currentSlide].classList.add("active");
    thumbnails[currentSlide].classList.add("active");

    // Update counter
    updateImageCounter();

    // Restart auto-slide
    restartAutoSlide();
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll(".slide");
    const thumbnails = document.querySelectorAll(".thumbnail");

    // Remove active class from current slide and thumbnail
    slides[currentSlide].classList.remove("active");
    thumbnails[currentSlide].classList.remove("active");

    // Set new slide index
    currentSlide = slideIndex;

    // Add active class to new slide and thumbnail
    slides[currentSlide].classList.add("active");
    thumbnails[currentSlide].classList.add("active");

    // Update counter
    updateImageCounter();

    // Restart auto-slide
    restartAutoSlide();
}

function updateImageCounter() {
    const currentImageElement = document.querySelector(".current-image");
    if (currentImageElement) {
        currentImageElement.textContent = currentSlide + 1;
    }
}

function scrollThumbnails(direction) {
    const container = document.querySelector(".thumbnail-container");
    const scrollAmount = 120; // Thumbnail width + gap

    container.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
    });
}

function openFullscreen() {
    const currentSlideImg = document.querySelector(".slide.active img");
    if (currentSlideImg) {
        // Create fullscreen modal
        const modal = document.createElement("div");
        modal.className = "fullscreen-modal";
        modal.innerHTML = `
      <div class="fullscreen-content">
        <img src="${currentSlideImg.src}" alt="${currentSlideImg.alt}">
        <button class="fullscreen-close" onclick="closeFullscreen()">
          <i class="fas fa-times"></i>
        </button>
        <div class="fullscreen-nav">
          <button onclick="changeSlideFullscreen(-1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button onclick="changeSlideFullscreen(1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

        // Add fullscreen styles
        modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";
    }
}

function closeFullscreen() {
    const modal = document.querySelector(".fullscreen-modal");
    if (modal) {
        modal.remove();
        document.body.style.overflow = "";
    }
}

function changeSlideFullscreen(direction) {
    changeSlide(direction);
    // Update fullscreen image
    const fullscreenImg = document.querySelector(".fullscreen-modal img");
    const currentSlideImg = document.querySelector(".slide.active img");
    if (fullscreenImg && currentSlideImg) {
        fullscreenImg.src = currentSlideImg.src;
        fullscreenImg.alt = currentSlideImg.alt;
    }
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

function handleKeyboardNavigation(event) {
    switch (event.key) {
        case "ArrowLeft":
            changeSlide(-1);
            break;
        case "ArrowRight":
            changeSlide(1);
            break;
        case "Escape":
            closeFullscreen();
            break;
    }
}

function addTouchSupport() {
    const slider = document.querySelector(".image-slider");
    let startX = 0;
    let startY = 0;

    slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    slider.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                changeSlide(1); // Swipe left - next slide
            } else {
                changeSlide(-1); // Swipe right - prev slide
            }
        }
    });
}

// Stop auto-slide when user interacts
document.addEventListener("click", (e) => {
    if (e.target.closest(".slider-nav") || e.target.closest(".thumbnail")) {
        restartAutoSlide();
    }
});

// Navigation functions
function goBackToVehicles() {
    window.location.href = "vehicles.html";
}

// Action functions
function editCurrentVehicle() {
    showToast("Edit functionality will be available soon!", "info");
}

function deleteCurrentVehicle() {
    const confirmMessage = `Are you sure you want to delete ${currentVehicle.brand} ${currentVehicle.name}?`;

    if (confirm(confirmMessage)) {
        showToast(
            `${currentVehicle.brand} ${currentVehicle.name} deleted successfully!`,
            "success"
        );

        // Redirect back to vehicles page after short delay
        setTimeout(() => {
            goBackToVehicles();
        }, 1500);
    }
}

// Quick action functions
function createBooking() {
    showToast("Redirecting to booking creation...", "info");
    setTimeout(() => {
        window.location.href = `bookings.html?vehicle=${currentVehicle.id}&action=create`;
    }, 1000);
}

function viewBookings() {
    showToast("Redirecting to vehicle bookings...", "info");
    setTimeout(() => {
        window.location.href = `bookings.html?vehicle=${currentVehicle.id}`;
    }, 1000);
}

function scheduleService() {
    showToast("Service scheduling feature coming soon!", "info");
}

// Status update function for dropdown
function updateVehicleStatus(newStatus) {
    const previousStatus = currentVehicle.status;
    currentVehicle.status = newStatus;

    // Update the visual status badge
    const statusBadge = document.querySelector(".status-badge-large");
    if (statusBadge) {
        statusBadge.className = `status-badge-large ${newStatus}`;
        statusBadge.innerHTML = `
      <i class="fas ${getStatusIcon(newStatus)}"></i>
      ${getStatusText(newStatus)}
    `;
    }

    // Show confirmation toast
    showToast(
        `Status changed from ${getStatusText(previousStatus)} to ${getStatusText(
            newStatus
        )}!`,
        "success"
    );

    console.log(
        `Vehicle ${currentVehicle.id} status changed from ${previousStatus} to ${newStatus}`
    );
}

function generateReport() {
    showToast("Generating vehicle report...", "info");

    setTimeout(() => {
        const reportData = {
            "Vehicle ID": `#VEH${currentVehicle.id.toString().padStart(3, "0")}`,
            Brand: currentVehicle.brand,
            Model: currentVehicle.name,
            "License Plate": currentVehicle.licensePlate,
            Status: getStatusText(currentVehicle.status),
            "Daily Rate": `$${currentVehicle.dailyRate}`,
            "Total Bookings": currentVehicle.totalBookings,
            "Total Revenue": `$${(
                currentVehicle.totalBookings * currentVehicle.dailyRate
            ).toLocaleString()}`,
        };

        // Simple CSV export
        const csv = [
            Object.keys(reportData).join(","),
            Object.values(reportData).join(","),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vehicle-report-${currentVehicle.id}-${
            new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showToast("Vehicle report downloaded!", "success");
    }, 1500);
}

// Detail section action functions
function editSpecs() {
    showToast("Technical specifications editing will be available soon!", "info");
}

function updatePricing() {
    showToast("Pricing update feature will be available soon!", "info");
}

function editFeatures() {
    showToast("Features editing will be available soon!", "info");
}

function viewDetailedStats() {
    showToast("Detailed statistics view will be available soon!", "info");
}

// Utility functions
function getStatusText(status) {
    const statusMap = {
        available: "Available",
        rented: "Rented",
        maintenance: "Maintenance",
        unavailable: "Unavailable",
    };
    return statusMap[status] || status;
}

function getStatusIcon(status) {
    const iconMap = {
        available: "fa-check-circle",
        rented: "fa-calendar",
        maintenance: "fa-tools",
        unavailable: "fa-times-circle",
    };
    return iconMap[status] || "fa-question-circle";
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

// Contact Owner function
function contactOwner() {
    showNotification("Opening contact form for owner", "info");
    // Here you could open a modal or navigate to contact page
    console.log("Contact owner: Huỳnh Minh Huy");
}

// Open Full Map function
function openFullMap() {
    const lat = 16.0460938;
    const lng = 108.2447044;
    const url = `https://www.google.com/maps/@${lat},${lng},15z`;
    window.open(url, "_blank");
    showNotification("Opening full map view", "info");
}

// Toggle Features functionality
function toggleFeatures() {
    const hiddenFeatures = document.querySelector(".features-hidden");
    const toggleBtn = document.querySelector(".btn-toggle-features");
    const toggleText = toggleBtn.querySelector(".toggle-text");
    const isExpanded = hiddenFeatures.classList.contains("expanded");

    if (isExpanded) {
        // Collapse
        hiddenFeatures.classList.remove("expanded");
        toggleBtn.classList.remove("expanded");
        toggleText.textContent = "Show More";
    } else {
        // Expand
        hiddenFeatures.classList.add("expanded");
        toggleBtn.classList.add("expanded");
        toggleText.textContent = "Show Less";
    }
}

// Features Vertical Scroll Handler
function initFeaturesScroll() {
    const scrollContainer = document.querySelector(
        ".features-scroll-container-vertical"
    );
    const scrollFade = document.querySelector(".scroll-fade-bottom");
    const featuresWrapper = document.querySelector(".features-vertical-scroll");

    if (!scrollContainer || !scrollFade || !featuresWrapper) return;

    // Check if scrolling is needed based on comparison with other cards
    function checkScrollNeed() {
        // Get heights of other cards for comparison
        const techCard = document.querySelector(
            ".detail-card:nth-child(1) .card-body"
        );
        const performanceCard = document.querySelector(
            ".detail-card:nth-child(3) .card-body"
        );

        let referenceHeight = 300; // Default fallback height

        if (techCard && performanceCard) {
            // Get the maximum height between tech and performance cards
            const techHeight = techCard.offsetHeight;
            const performanceHeight = performanceCard.offsetHeight;
            referenceHeight = Math.max(techHeight, performanceHeight);
        }

        // Remove any existing max-height to measure natural content height
        scrollContainer.style.maxHeight = "none";
        featuresWrapper.style.maxHeight = "none";

        // Get natural content height
        const contentHeight = scrollContainer.scrollHeight;

        // Determine if we need scroll based on comparison with reference height
        const needsScroll = contentHeight > referenceHeight;

        if (needsScroll) {
            // Set max-height to reference height and enable scrolling
            scrollContainer.style.maxHeight = referenceHeight + "px";
            featuresWrapper.style.maxHeight = referenceHeight + "px";
            featuresWrapper.classList.add("needs-scroll");
            scrollFade.style.display = "block";
        } else {
            // Remove max-height restrictions and disable scrolling
            scrollContainer.style.maxHeight = "none";
            featuresWrapper.style.maxHeight = "none";
            featuresWrapper.classList.remove("needs-scroll");
            scrollFade.style.display = "none";
        }

        return needsScroll;
    }

    // Handle scroll events - only if scrolling is needed
    scrollContainer.addEventListener("scroll", () => {
        if (!featuresWrapper.classList.contains("needs-scroll")) return;

        const isScrolledToBottom =
            scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight - 10; // 10px tolerance

        if (isScrolledToBottom) {
            scrollFade.style.opacity = "0";
            scrollContainer.classList.add("scrolled-bottom");
        } else {
            scrollFade.style.opacity = "";
            scrollContainer.classList.remove("scrolled-bottom");
        }
    });

    // Initial check with delay to ensure all content is rendered
    setTimeout(() => {
        checkScrollNeed();
    }, 200);

    // Recheck on window resize
    window.addEventListener("resize", () => {
        setTimeout(checkScrollNeed, 200);
    });

    // Also recheck when fonts are loaded (affects height calculations)
    if (document.fonts) {
        document.fonts.ready.then(() => {
            setTimeout(checkScrollNeed, 100);
        });
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initFeaturesScroll);

// Export functions to global scope
window.goBackToVehicles = goBackToVehicles;
window.editCurrentVehicle = editCurrentVehicle;
window.deleteCurrentVehicle = deleteCurrentVehicle;
window.createBooking = createBooking;
window.viewBookings = viewBookings;
window.scheduleService = scheduleService;
window.updateVehicleStatus = updateVehicleStatus;
window.generateReport = generateReport;
window.editSpecs = editSpecs;
window.updatePricing = updatePricing;
window.editFeatures = editFeatures;
window.viewDetailedStats = viewDetailedStats;
window.contactOwner = contactOwner;
window.openFullMap = openFullMap;
window.toggleFeatures = toggleFeatures;

// Admin Approval Functions
window.approveVehicle = approveVehicle;
window.rejectVehicle = rejectVehicle;
window.requestMoreInfo = requestMoreInfo;
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.approveVehicle = approveVehicle;

// Add or replace this function in your existing vehicle-detail.js
function approveVehicle() {
    Swal.fire({
        title: "Approve Vehicle?",
        html: `
      <div style="text-align: left; margin: 10px 0;">
        <p style="color: #6b7280; margin-bottom: 8px;">
          Are you sure you want to approve this vehicle? It will become AVAILABLE and the owner will be notified.
        </p>
      </div>
    `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: '<i class="fas fa-check"></i> Yes, Approve',
        cancelButtonText: '<i class="fas fa-arrow-left"></i> Cancel',
        width: "480px",
        padding: "1.8rem",
        backdrop: "rgba(0,0,0,0.6)"
    }).then((result) => {
        if (result.isConfirmed) {
            // Processing modal: DO NOT call Swal.showLoading() -> we keep only the custom spinner below
            Swal.fire({
                title: "Processing...",
                html: `
          <div style="text-align:center;">
            <p style="color:#6b7280; margin:0 0 12px 0;">Approving vehicle and notifying owner...</p>
            <!-- Custom spinner kept: using FontAwesome spin icon -->
            <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
              <i class="fas fa-circle-notch" style="font-size:28px; color:#10b981; animation: fa-spin 1s linear infinite;"></i>
            </div>
          </div>
        `,
                allowOutsideClick: false,
                showConfirmButton: false,
                // didOpen left empty on purpose to avoid Swal built-in spinner
                width: "480px",
                padding: "1.4rem"
            });

            // Submit hidden form after short delay so user sees processing modal
            setTimeout(() => {
                const approveForm = document.getElementById("approveForm");
                if (approveForm) {
                    approveForm.submit();
                } else {
                    Swal.close();
                    console.warn("approveForm not found.");
                }
            }, 1200);
        }
    });
}

// Ensure function is accessible globally (if you export functions at the end of file)


function rejectVehicle() {
    // Step 1: Nhập lý do reject
    Swal.fire({
        title: "🚫 Reject Vehicle",
        html: `
      <div style="text-align: left; margin: 20px 0;">
        <p style="color: #6b7280; margin-bottom: 15px; font-size: 14px;">
          Please provide a detailed reason for rejecting this vehicle. This information will be sent to the vehicle owner.
        </p>
        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">
          Rejection Reason *
        </label>
      </div>
    `,
        input: "textarea",
        inputPlaceholder:
            "Please specify the reason for rejection...\n\nExample:\n• Vehicle documents are incomplete\n• Photos are unclear or insufficient\n• Vehicle condition does not meet standards\n• Additional information required",
        inputAttributes: {
            "aria-label": "Rejection reason",
            style: "min-height: 150px; font-family: inherit; font-size: 14px; line-height: 1.5;",
        },
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: '<i class="fas fa-times-circle"></i> Reject Vehicle',
        cancelButtonText: '<i class="fas fa-arrow-left"></i> Cancel',
        customClass: {
            container: "rejection-modal",
            popup: "rejection-popup",
            title: "rejection-title",
            confirmButton: "rejection-confirm-btn",
            cancelButton: "rejection-cancel-btn",
        },
        width: "500px",
        padding: "2rem",
        backdrop: "rgba(0,0,0,0.8)",
        inputValidator: (value) => {
            if (!value || value.trim().length < 15) {
                return "Please provide a detailed reason (at least 15 characters)";
            }
            if (value.trim().length > 500) {
                return "Reason is too long (maximum 500 characters)";
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Step 2: Modal xác nhận lại lý do
            Swal.fire({
                title: "Confirm Rejection",
                html: `
          <div style="text-align: left;">
            <p style="color: #6b7280; margin-bottom: 15px;">
              Are you sure you want to reject this vehicle with the following reason?
            </p>
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <strong style="color: #dc2626;">Rejection Reason:</strong>
              <p style="color: #991b1b; margin: 8px 0 0 0; font-style: italic; line-height: 1.4;">
                "${result.value}"
              </p>
            </div>
            <p style="color: #ef4444; font-size: 13px; margin-top: 15px;">
              <i class="fas fa-exclamation-triangle"></i> This action cannot be undone and the vehicle owner will be notified.
            </p>
          </div>
        `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: '<i class="fas fa-check"></i> Yes, Reject Vehicle',
                cancelButtonText: '<i class="fas fa-edit"></i> Edit Reason',
                customClass: {
                    container: "rejection-confirm-modal",
                },
            }).then((confirmResult) => {
                if (confirmResult.isConfirmed) {
                    // Step 3: Modal "Processing Rejection", sau 2.5s thì submit form
                    Swal.fire({
                        title: "Processing Rejection...",
                        html: `
              <div style="text-align: center;">
                <div style="margin: 20px 0;">
                  <i class="fas fa-envelope" style="font-size: 24px; color: #dc2626; margin-bottom: 10px;"></i>
                  <p style="color: #6b7280; margin: 0;">Notifying vehicle owner...</p>
                </div>
              </div>
            `,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });
                    setTimeout(() => {
                        // Gán lý do vào input ẩn rồi submit form truyền thống
                        document.getElementById("rejectReasonInput").value = result.value;
                        document.getElementById("rejectForm").submit();
                    }, 2500);
                } else if (confirmResult.dismiss === Swal.DismissReason.cancel) {
                    // Quay lại sửa lý do
                    setTimeout(() => {
                        rejectVehicle();
                    }, 100);
                }
            });
        }
    });
}

function requestMoreInfo() {
    // Show info request dialog
    Swal.fire({
        title: "Request More Information",
        text: "What additional information do you need from the vehicle owner?",
        input: "textarea",
        inputPlaceholder: "Specify the information needed...",
        inputAttributes: {
            "aria-label": "Information request",
        },
        showCancelButton: true,
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Send Request",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
            if (!value || value.trim().length < 5) {
                return "Please specify what information is needed";
            }
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading state
            Swal.fire({
                title: "Sending Request...",
                text: "Notifying vehicle owner...",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Simulate API call
            setTimeout(() => {
                // Show success message
                Swal.fire({
                    title: "Request Sent!",
                    text: "The vehicle owner has been notified and will provide the requested information.",
                    icon: "success",
                    confirmButtonColor: "#f59e0b",
                    confirmButtonText: "OK",
                });

                // Add a notification to the activity feed
                addActivityNotification(
                    "Information requested from vehicle owner",
                    result.value
                );
            }, 1500);
        }
    });
}

function editVehicle() {
    showToast("Redirecting to vehicle edit page...", "info");
    setTimeout(() => {
        window.location.href = `/admin/vehicles/edit/${currentVehicle.id}`;
    }, 1000);
}

function deleteVehicle() {
    // Show confirmation dialog with more serious warning
    Swal.fire({
        title: "Delete Vehicle?",
        text: "This action cannot be undone. All related bookings and data will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        customClass: {
            container: "delete-modal",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading state
            Swal.fire({
                title: "Deleting...",
                text: "Removing vehicle from system...",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Simulate API call
            setTimeout(() => {
                // Show success message
                Swal.fire({
                    title: "Vehicle Deleted",
                    text: "The vehicle has been permanently removed from the system.",
                    icon: "success",
                    confirmButtonColor: "#ef4444",
                    confirmButtonText: "OK",
                }).then(() => {
                    // Redirect back to vehicles list
                    window.location.href = "/admin/vehicles";
                });
            }, 2000);
        }
    });
}

// Helper function to update UI when vehicle is approved
function updateVehicleToApproved() {
    // Update status badge
    const statusBadge = document.querySelector(".status-badge-large");
    if (statusBadge) {
        statusBadge.className = "status-badge-large available";
        statusBadge.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Available</span>
    `;
    }

    // Update the quick actions bar to show regular actions
    const quickActionsBar = document.querySelector(".quick-actions-bar");
    if (quickActionsBar) {
        quickActionsBar.innerHTML = `
      <div class="action-buttons">
        <button class="quick-action" onclick="createBooking()" title="Create Booking">
          <i class="fas fa-plus"></i>
          <span>New Booking</span>
        </button>
        <button class="quick-action" onclick="viewBookings()" title="View Bookings">
          <i class="fas fa-calendar"></i>
          <span>Bookings</span>
        </button>
        <button class="quick-action" onclick="scheduleService()" title="Schedule Service">
          <i class="fas fa-tools"></i>
          <span>Service</span>
        </button>
        <button class="quick-action" onclick="generateReport()" title="Generate Report">
          <i class="fas fa-chart-bar"></i>
          <span>Report</span>
        </button>
        <div class="status-selector-container">
          <select class="status-selector" onchange="updateVehicleStatus(this.value)">
            <option value="available" selected>Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <i class="fas fa-chevron-down status-dropdown-icon"></i>
        </div>
      </div>
    `;
    }

    // Update header actions
    const headerActions = document.querySelector(".header-actions");
    if (headerActions) {
        headerActions.innerHTML = `
      <button class="btn btn-outline" onclick="editVehicle()" title="Edit Vehicle">
        <i class="fas fa-edit"></i>
        Edit Vehicle
      </button>
      <button class="btn btn-danger" onclick="deleteVehicle()" title="Delete Vehicle">
        <i class="fas fa-trash"></i>
        Delete
      </button>
    `;
    }
}

// Helper function to add activity notification
function addActivityNotification(title, description) {
    const activityList = document.querySelector(".activity-list");
    if (activityList) {
        const newActivity = document.createElement("div");
        newActivity.className = "activity-item";
        newActivity.innerHTML = `
      <div class="activity-icon update">
        <i class="fas fa-info-circle"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${title}</div>
        <div class="activity-description">${description}</div>
        <div class="activity-time">Just now</div>
      </div>
    `;

        // Insert at the beginning of the list
        activityList.insertBefore(newActivity, activityList.firstChild);

        // Animate the new item
        newActivity.style.opacity = "0";
        newActivity.style.transform = "translateY(-20px)";

        setTimeout(() => {
            newActivity.style.transition = "all 0.3s ease";
            newActivity.style.opacity = "1";
            newActivity.style.transform = "translateY(0)";
        }, 100);
    }
}
