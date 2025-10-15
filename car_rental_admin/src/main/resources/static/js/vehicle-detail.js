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
