// Làm mới table
function refreshApplications() {
    window.location.reload(); // hoặc gọi ajax nếu muốn load động
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