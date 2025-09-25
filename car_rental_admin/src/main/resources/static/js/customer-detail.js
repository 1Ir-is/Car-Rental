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
