let stompClient = null;

function connectWebSocketNotify() {
    console.log("Connecting to WebSocket at http://localhost:8080/ws-notify");
    const socket = new SockJS('http://localhost:8080/ws-notify');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("WebSocket connected:", frame);
        stompClient.subscribe('/topic/owner-request', function (message) {
            console.log("Received notification:", message.body);
            // Không cần gọi saveNotificationToServer(noti) nếu notification đã được lưu ở backend!
            fetchNotificationsFromServer(); // Chỉ cần fetch lại danh sách
        });
    }, function (error) {
        console.error("WebSocket connection error:", error);
    });
}

// Cập nhật badge chuông
function updateNotificationBadge() {
    let dot = document.querySelector('.notification-dot');
    if (!dot) {
        const btn = document.querySelector('.notification-btn');
        if (btn) {
            dot = document.createElement('span');
            dot.className = 'notification-dot';
            btn.appendChild(dot);
        }
    }
    const list = document.querySelector('.notification-list');
    const unreadCount = list ? list.querySelectorAll('.notification-item.unread').length : 0;
    dot.style.display = unreadCount > 0 ? 'inline-block' : 'none';
}

function saveNotificationToServer(noti) {
    noti.isRead = false;
    // Đảm bảo gửi đúng kiểu chuỗi ISO cho LocalDateTime
    noti.createdAt = new Date().toISOString(); // <-- CHUỖI ISO, không phải số
    fetch('/admin/notifications/api/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(noti)
    }).then(() => {
        fetchNotificationsFromServer();
    });
}
// Fetch notification từ backend khi load/chuyển tab
function fetchNotificationsFromServer() {
    fetch('/admin/notifications/api/latest?limit=5')
        .then(res => res.json())
        .then(data => {
            renderNotifications(data);
            updateNotificationBadge();
            updateMarkAllReadButton(data);
        });
}

// Render notification-list
function renderNotifications(notifications) {
    const list = document.querySelector('.notification-list');
    list.innerHTML = '';
    if (!notifications || notifications.length === 0) {
        list.innerHTML = `<div class="notification-item"><div class="notification-content"><p>No notifications.</p></div></div>`;
    } else {
        notifications.forEach(noti => {
            const div = document.createElement('div');
            div.className = 'notification-item ' + (!noti.isRead ? 'unread' : '');
            div.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-user text-success"></i>
                </div>
                <div class="notification-content">
                    <p>${noti.content}</p>
                    <span class="time">${formatTime(noti.createdAt)}</span>
                </div>
                <a class="notification-link" href="${noti.url || '/admin/approval-application'}"></a>
            `;
            // Nếu là chưa đọc, khi click sẽ gọi API mark-read, sau đó chuyển trang
            div.onclick = function () {
                if (!noti.isRead) {
                    fetch('/admin/notifications/api/mark-read/' + noti.id, {method: 'POST'})
                        .then(() => {
                            // Đợi fetch lại từ backend rồi mới chuyển trang
                            fetch('/admin/notifications/api/latest?limit=5')
                                .then(res => res.json())
                                .then(data => {
                                    renderNotifications(data);
                                    updateNotificationBadge();
                                    setTimeout(function() {
                                        window.location.href = noti.url || '/admin/approval-application';
                                    }, 100); // Cho UI kịp update
                                });
                        });
                } else {
                    window.location.href = noti.url || '/admin/approval-application';
                }
            };
            list.appendChild(div);
        });
    }
}

function updateMarkAllReadButton(notifications) {
    // Đếm số thông báo chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;
    let header = document.querySelector('.dropdown-header');
    let markAllBtn = header.querySelector('.mark-all-read-btn');

    // Nếu có thông báo chưa đọc và nút chưa tồn tại thì thêm vào
    if (unreadCount > 0 && !markAllBtn) {
        markAllBtn = document.createElement('button');
        markAllBtn.className = 'mark-all-read-btn';
        markAllBtn.type = 'button';
        markAllBtn.innerText = 'Mark all as read';
        markAllBtn.onclick = function() {
            fetch('/admin/notifications/api/mark-all-read', {method: 'POST'})
                .then(() => {
                    fetchNotificationsFromServer();
                });
        };
        header.appendChild(markAllBtn);
    }
    // Nếu không còn thông báo chưa đọc thì ẩn nút
    if (unreadCount === 0 && markAllBtn) {
        markAllBtn.remove();
    }
}

// Format thời gian
function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
}


// Khi load trang/chuyển tab
document.addEventListener("DOMContentLoaded", function () {
    fetchNotificationsFromServer();
    connectWebSocketNotify();

    // Mark all as read
    const markAllBtn = document.querySelector('.mark-all-read-btn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function () {
            fetch('/admin/notifications/api/mark-all-read', {method: 'POST'})
                .then(() => {
                    fetchNotificationsFromServer();
                });
        });
    }
});