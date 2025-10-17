// Admin notifications client - updated to show car icon for vehicle submissions

let stompClient = null;

function connectWebSocketNotify() {
    // Adjust endpoint if your WS server runs on different port/host
    const WS_ENDPOINT = window.WS_NOTIFY_URL ? (window.WS_NOTIFY_URL + '/ws-notify') : 'http://localhost:8080/ws-notify';
    console.log("Connecting to WebSocket at", WS_ENDPOINT);
    const socket = new SockJS(WS_ENDPOINT);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("WebSocket connected:", frame);
        // Existing subscription (reused)
        stompClient.subscribe('/topic/owner-request', function (message) {
            console.log("Received notification (owner-request):", message.body);
            fetchNotificationsFromServer();
        });

        // Optional: subscribe dedicated topic for vehicle submissions (if backend sends there)
        // Uncomment if you broadcast to /topic/vehicle-submitted and want separate handling
        // stompClient.subscribe('/topic/vehicle-submitted', function (message) {
        //   console.log("Received vehicle-submitted notification:", message.body);
        //   fetchNotificationsFromServer();
        // });
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
    if (dot) dot.style.display = unreadCount > 0 ? 'inline-block' : 'none';
}

function saveNotificationToServer(noti) {
    noti.isRead = false;
    // Đảm bảo gửi đúng kiểu chuỗi ISO cho LocalDateTime
    noti.createdAt = new Date().toISOString();
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
        })
        .catch(err => {
            console.error("Failed to fetch notifications:", err);
        });
}

// Render notification-list (updated: choose icon by noti.type)
function renderNotifications(notifications) {
    const list = document.querySelector('.notification-list');
    if (!list) return;
    list.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        list.innerHTML = `<div class="notification-item"><div class="notification-content"><p>No notifications.</p></div></div>`;
        updateNotificationBadge();
        updateMarkAllReadButton([]);
        return;
    }

    notifications.forEach(noti => {
        const div = document.createElement('div');
        div.className = 'notification-item ' + (!noti.isRead ? 'unread' : '');

        // Choose icon based on notification type
        // (FontAwesome classes; adjust if you use another version)
        let iconClass = 'fas fa-info-circle text-secondary';
        if (noti.type === 'OWNER_REQUEST') {
            iconClass = 'fas fa-user text-success';
        } else if (noti.type === 'VEHICLE_SUBMISSION') {
            iconClass = 'fas fa-car text-primary';
        } else if (noti.type === 'BOOKING_ALERT') {
            iconClass = 'fas fa-calendar text-warning';
        } else if (noti.type === 'MAINTENANCE') {
            iconClass = 'fas fa-tools text-primary';
        }

        const safeContent = escapeHtml(noti.content);

        div.innerHTML = `
      <div class="notification-icon">
        <i class="${iconClass}" aria-hidden="true"></i>
      </div>
      <div class="notification-content">
        <p>${safeContent}</p>
        <span class="time">${formatTime(noti.createdAt)}</span>
      </div>
      <a class="notification-link" href="${noti.url || '/admin/approval-application'}"></a>
    `;

        div.onclick = function () {
            if (!noti.isRead) {
                fetch('/admin/notifications/api/mark-read/' + noti.id, {method: 'POST'})
                    .then(() => {
                        // reload latest notifications then navigate
                        fetch('/admin/notifications/api/latest?limit=5')
                            .then(res => res.json())
                            .then(data => {
                                renderNotifications(data);
                                updateNotificationBadge();
                                setTimeout(function() {
                                    window.location.href = noti.url || '/admin/approval-application';
                                }, 100);
                            });
                    })
                    .catch(err => {
                        console.error("Failed to mark as read:", err);
                        window.location.href = noti.url || '/admin/approval-application';
                    });
            } else {
                window.location.href = noti.url || '/admin/approval-application';
            }
        };

        list.appendChild(div);
    });

    updateNotificationBadge();
    updateMarkAllReadButton(notifications);
}

// Count unread and show/hide "Mark all as read"
function updateMarkAllReadButton(notifications) {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const header = document.querySelector('.dropdown-header');
    if (!header) return;
    let markAllBtn = header.querySelector('.mark-all-read-btn');

    if (unreadCount > 0 && !markAllBtn) {
        markAllBtn = document.createElement('button');
        markAllBtn.className = 'mark-all-read-btn';
        markAllBtn.type = 'button';
        markAllBtn.innerText = 'Mark all as read';
        markAllBtn.onclick = function() {
            fetch('/admin/notifications/api/mark-all-read', {method: 'POST'})
                .then(() => {
                    fetchNotificationsFromServer();
                })
                .catch(err => console.error("Mark all read failed:", err));
        };
        header.appendChild(markAllBtn);
    }

    if (unreadCount === 0 && markAllBtn) {
        markAllBtn.remove();
    }
}

// Format thời gian
function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
}

// Escape HTML helper to avoid XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// On load
document.addEventListener("DOMContentLoaded", function () {
    fetchNotificationsFromServer();
    connectWebSocketNotify();

    // Mark all as read (in case mark-all button exists on initial render)
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