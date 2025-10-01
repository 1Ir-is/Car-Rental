let stompClient = null;
let unreadNotificationCount = 0;

function connectWebSocketNotify() {
    console.log("Connecting to WebSocket at http://localhost:8080/ws-notify");
    const socket = new SockJS('http://localhost:8080/ws-notify');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("WebSocket connected:", frame);
        stompClient.subscribe('/topic/owner-request', function (message) {
            console.log("Received notification:", message.body);
            const noti = JSON.parse(message.body);
            handleAdminNotification(noti);
        });
    }, function (error) {
        console.error("WebSocket connection error:", error);
    });
}

function handleAdminNotification(noti) {
    // 1. Thêm vào danh sách notification (notification-list)
    const list = document.querySelector('.notification-list');
    let newDiv = null;
    if (list) {
        // Xóa dòng "No notifications" nếu có
        const empty = list.querySelector('.notification-item p');
        if (empty && empty.textContent.includes('No notifications')) {
            list.innerHTML = '';
        }
        newDiv = document.createElement('div');
        newDiv.className = 'notification-item unread';
        newDiv.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-user text-success"></i>
            </div>
            <div class="notification-content">
                <p>${noti.content}</p>
                <span class="time">Just now</span>
            </div>
            <a class="notification-link" href="${noti.url}"></a>
        `;
        newDiv.onclick = () => window.location.href = noti.url;
        if (list.firstChild) {
            list.insertBefore(newDiv, list.firstChild);
        } else {
            list.appendChild(newDiv);
        }
    }

    // 2. Cập nhật badge dựa trên số lượng notification chưa đọc
    updateNotificationBadge();
}

function updateNotificationBadge() {
    let badge = document.querySelector('.notification-badge');
    if (!badge) {
        const btn = document.querySelector('.notification-btn');
        if (btn) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            btn.appendChild(badge);
        }
    }
    const list = document.querySelector('.notification-list');
    const unreadCount = list ? list.querySelectorAll('.notification-item.unread').length : 0;
    badge.innerText = unreadCount > 0 ? unreadCount : '';
    badge.style.display = unreadCount > 0 ? '' : 'none';
}

// Xử lý Mark all as read
document.addEventListener("DOMContentLoaded", function () {
    connectWebSocketNotify();

    const markAllBtn = document.querySelector('.mark-all-read-btn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function (e) {
            // Đánh dấu tất cả là đã đọc trên UI
            const list = document.querySelector('.notification-list');
            if (list) {
                list.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
            }
            updateNotificationBadge();
            // Không cần set biến global, badge luôn đồng bộ với DOM
        });
    }
});