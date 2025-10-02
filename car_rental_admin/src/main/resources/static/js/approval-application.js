// Làm mới table
function refreshApplications() {
    window.location.reload(); // hoặc gọi ajax nếu muốn load động
}

// SweetAlert confirm for APPROVE
function confirmApprove(btn) {
    Swal.fire({
        title: 'Approve Application?',
        text: 'Are you sure you want to approve this application?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve!',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            btn.closest('form').submit();
        }
    });
}

// SweetAlert confirm for REJECT
function confirmReject(btn) {
    Swal.fire({
        title: 'Reject Application?',
        text: 'Are you sure you want to reject this application?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject!',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            btn.closest('form').submit();
        }
    });
}

// SweetAlert confirm for REVOKE
function confirmRevoke(btn) {
    Swal.fire({
        title: 'Revoke Owner Rights?',
        text: 'Are you sure you want to revoke owner rights for this user?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, revoke!',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            btn.closest('form').submit();
        }
    });
}

document.getElementById('status-filter').addEventListener('change', function () {
    document.getElementById('filterForm').submit();
});
document.getElementById('type-filter').addEventListener('change', function () {
    document.getElementById('filterForm').submit();
});
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') document.getElementById('filterForm').submit();
});