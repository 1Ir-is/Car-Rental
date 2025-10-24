import React, { useRef, useState, useEffect } from "react";

import {
  Container,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../styles/header.css";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const navLinks = [
  { path: "/home", display: "Home" },
  { path: "/about", display: "About" },
  { path: "/cars", display: "Cars" },
  { path: "/blogs", display: "Blog" },
  { path: "/contact", display: "Contact" },
];

const Header = () => {
  const menuRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Real-time notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompRef = useRef(null);
  // thêm lên trên cùng với stompRef
  const stompSubRef = useRef(null);

  // Helper function to check if user is owner (handles both string and number)
  const isOwner = (user) => {
    if (!user || !user.role) return false;
    return user.role.id && user.role.id.toString() === "3";
  };

  const toggleMenu = () => menuRef.current.classList.toggle("menu__active");
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationOpen && !event.target.closest(".notification__wrapper")) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success("Logged out successfully");
        navigate("/home");
      }
    } catch (error) {
      toast.error("Error during logout");
    }
  };

  // Get user's initials for avatar
  const getUserInitials = (user) => {
    if (user?.name) {
      const nameParts = user.name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[
          nameParts.length - 1
        ].charAt(0)}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Format ISO time string -> readable
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString() + " " + d.toLocaleDateString();
    } catch (e) {
      return isoString;
    }
  };

  // API base for owner backend (where Notification REST + WS live)
  const OWNER_API_BASE =
    process.env.REACT_APP_OWNER_API || "http://localhost:8081";
  const OWNER_WS_BASE = process.env.REACT_APP_OWNER_WS || OWNER_API_BASE;

  // Fetch initial notifications and connect websocket when user signs in
  useEffect(() => {
    if (!isAuthenticated || !user || !user.id) return;

    let mounted = true;

    // helper: dedupe an array by id (keep first occurrence)
    const dedupeById = (arr) => {
      const map = new Map();
      for (const it of arr) {
        if (it && it.id != null && !map.has(it.id)) {
          map.set(it.id, it);
        }
      }
      return Array.from(map.values());
    };

    // 1) initial load
    fetch(
      `${OWNER_API_BASE}/api/notifications/users/${user.id}/latest?limit=10`,
      {
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // dedupe just in case backend returned duplicates
        const list = dedupeById(data || []);
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
      });

    // 2) connect websocket using @stomp/stompjs + SockJS
    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(`${OWNER_WS_BASE}/ws-notify`),
        debug: () => {},
        reconnectDelay: 5000,
        onConnect: () => {
          const topic = `/topic/notifications-user-${user.id}`;

          // subscribe and save subscription so we can unsubscribe later
          const sub = client.subscribe(topic, (message) => {
            try {
              const payload = JSON.parse(message.body);

              // if payload has no id, you can optionally ignore or still append
              if (!payload || payload.id == null) {
                console.warn(
                  "Notification payload without id received",
                  payload
                );
                return;
              }

              // Add only if not already present
              setNotifications((prev) => {
                // if prev already contains payload.id -> skip
                const exists = prev.some((n) => n && n.id === payload.id);
                if (exists) {
                  return prev;
                }
                const newList = [payload, ...prev].slice(0, 50); // keep latest 50
                return newList;
              });

              // Increase unread count only if it's a new notification
              setUnreadCount((prev) => {
                return prev + 1;
              });
            } catch (e) {
              console.error("Invalid notification payload", e);
            }
          });

          // store subscription so we can unsubscribe later
          stompSubRef.current = sub;
        },
        onStompError: (frame) => {
          console.error(
            "Broker reported error: " +
              (frame && frame.headers && frame.headers["message"])
          );
          console.error("Additional details: " + (frame && frame.body));
        },
      });

      client.activate();
      stompRef.current = client;
    } catch (e) {
      console.error("WebSocket init error:", e);
    }

    return () => {
      mounted = false;
      try {
        // unsubscribe if subscribed
        if (
          stompSubRef.current &&
          typeof stompSubRef.current.unsubscribe === "function"
        ) {
          try {
            stompSubRef.current.unsubscribe();
          } catch (e) {
            /* ignore */
          }
          stompSubRef.current = null;
        }
        // deactivate client (disconnect)
        if (stompRef.current) {
          stompRef.current.deactivate().catch(() => {});
          stompRef.current = null;
        }
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Mark a single notification as read and optionally navigate
  // Mark a single notification as read (NO NAVIGATION)
  const markNotificationRead = async (noti) => {
    try {
      if (!noti.isRead) {
        await fetch(
          `${OWNER_API_BASE}/api/notifications/users/${user.id}/mark-read/${noti.id}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        setNotifications((prev) =>
          prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // optional: show a small confirmation toast
        toast.dismiss();
        toast.success("Notification marked read", { autoClose: 1200 });
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
    // intentionally do NOT navigate
  };
  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await fetch(
        `${OWNER_API_BASE}/api/notifications/users/${user.id}/mark-all-read`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  return (
    <header className="header" ref={headerRef}>
      {/* ============ header top ============ */}
      <div className="header__top">
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              <div className="header__top__left">
                <span className="help-text">Need Help?</span>
                <span className="header__top__help">
                  <i className="ri-phone-fill"></i> +84-914-048-099
                </span>
              </div>
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="header__top__right d-flex align-items-center justify-content-end gap-3">
                {isAuthenticated && user ? (
                  <>
                    {/* Notification Icons */}
                    <div className="header__icons d-flex align-items-center gap-2">
                      {/* Notifications */}
                      <div className="notification__wrapper position-relative">
                        <div
                          className="icon-wrapper"
                          title="Notifications"
                          onClick={() => setNotificationOpen(!notificationOpen)}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="ri-notification-3-line"></i>
                          {unreadCount > 0 && (
                            <span className="icon-badge new-notification">
                              {unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Notification Dropdown */}
                        {notificationOpen && (
                          <div
                            className="notification__dropdown position-absolute"
                            style={{
                              top: "100%",
                              right: "0",
                              width: "350px",
                              background: "white",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              zIndex: 1000,
                              marginTop: "10px",
                            }}
                          >
                            {/* Dropdown Header */}
                            <div
                              className="notification__header p-3 border-bottom"
                              style={{
                                background: "#f8f9fa",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <h6
                                  className="mb-0 fw-bold"
                                  style={{ color: "#212245" }}
                                >
                                  Notifications
                                </h6>
                                <span
                                  className="text-primary fw-bold"
                                  style={{
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                  onClick={markAllRead}
                                >
                                  Mark all read
                                </span>
                              </div>
                            </div>

                            {/* Notification List */}
                            <div
                              className="notification__list"
                              style={{ maxHeight: "400px", overflowY: "auto" }}
                            >
                              {notifications.length === 0 && (
                                <div className="p-3">
                                  <small className="text-muted">
                                    No notifications.
                                  </small>
                                </div>
                              )}

                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className="notification__item p-3 border-bottom"
                                  style={{
                                    cursor: "pointer",
                                    background: notification.isRead
                                      ? "white"
                                      : "#f8f9ff",
                                    transition: "background-color 0.2s ease",
                                  }}
                                  onClick={() =>
                                    markNotificationRead(notification)
                                  }
                                >
                                  <div className="d-flex align-items-start gap-3">
                                    <div
                                      className="notification__icon"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: `${
                                          notification.color || "#dee2e6"
                                        }15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: notification.color || "#6c757d",
                                        fontSize: "18px",
                                      }}
                                    >
                                      <i
                                        className={
                                          notification.icon ||
                                          "ri-notification-line"
                                        }
                                      ></i>
                                    </div>
                                    <div className="notification__content flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <h6
                                          className="notification__title mb-1"
                                          style={{
                                            color: "#212245",
                                            fontSize: "14px",
                                            fontWeight: notification.isRead
                                              ? "500"
                                              : "600",
                                          }}
                                        >
                                          {notification.title ||
                                            (notification.content &&
                                              notification.content.split(
                                                "."
                                              )[0])}
                                        </h6>
                                        {!notification.isRead && (
                                          <div
                                            style={{
                                              width: "8px",
                                              height: "8px",
                                              borderRadius: "50%",
                                              background: "#007bff",
                                            }}
                                          ></div>
                                        )}
                                      </div>

                                      <small
                                        className="notification__time"
                                        style={{
                                          color: "#adb5bd",
                                          fontSize: "11px",
                                        }}
                                      >
                                        {formatTime(notification.createdAt)}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Dropdown Footer */}
                            <div
                              className="notification__footer p-3 text-center"
                              style={{
                                background: "#f8f9fa",
                                borderBottomLeftRadius: "8px",
                                borderBottomRightRadius: "8px",
                              }}
                            >
                              <Link
                                to="/notifications"
                                className="text-decoration-none fw-bold"
                                style={{ color: "#007bff", fontSize: "13px" }}
                                onClick={() => setNotificationOpen(false)}
                              >
                                View All Notifications
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                      <DropdownToggle
                        tag="div"
                        className="user-dropdown d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="user-avatar position-relative">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="User Avatar"
                              className="avatar-img rounded-circle"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                border: "2px solid #fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            />
                          ) : (
                            <div
                              className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                              style={{
                                width: "40px",
                                height: "40px",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                border: "2px solid #fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              {getUserInitials(user)}
                            </div>
                          )}
                          {(user.trustPoint || user.trust_point) && (
                            <span
                              className="position-absolute bg-warning text-dark rounded-pill px-1"
                              style={{
                                top: "-5px",
                                right: "-8px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                minWidth: "20px",
                                height: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                              }}
                            >
                              {user.trustPoint || user.trust_point}
                            </span>
                          )}
                        </div>
                        <div className="user-info">
                          <span className="user-name text-white">
                            {user.name}
                          </span>
                          {(user.trustPoint || user.trust_point) && (
                            <div className="trust-point-small">
                              <small className="text-light opacity-75">
                                <i className="ri-star-fill text-warning me-1"></i>
                                {user.trustPoint || user.trust_point} điểm
                              </small>
                            </div>
                          )}
                        </div>
                        <i className="ri-arrow-down-s-line text-white"></i>
                      </DropdownToggle>
                      <DropdownMenu end>
                        <DropdownItem header className="px-3 py-2">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt="User Avatar"
                                  className="rounded-circle"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    fontSize: "1.2rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getUserInitials(user)}
                                </div>
                              )}
                            </div>
                            <div>
                              <strong>{user.name}</strong>
                              <br />
                              <small className="text-muted">{user.email}</small>
                              {isOwner(user) && (
                                <div className="mt-1">
                                  <span className="badge bg-success">
                                    <i className="ri-vip-crown-line me-1"></i>
                                    Owner
                                  </span>
                                </div>
                              )}
                              {(user.trustPoint || user.trust_point) && (
                                <div className="mt-1">
                                  <span className="badge bg-warning text-dark">
                                    <i className="ri-star-fill me-1"></i>
                                    {user.trustPoint || user.trust_point} Trust
                                    Points
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem
                          onClick={() => navigate("/followed-vehicles")}
                        >
                          <i className="ri-heart-line me-2"></i> Followed
                          Vehicles
                        </DropdownItem>
                        {isOwner(user) && (
                          <>
                            <DropdownItem
                              onClick={() => navigate("/owner/dashboard")}
                              className="owner-dashboard-option"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                                color: "white",
                                borderRadius: "8px",
                                margin: "0.5rem",
                                fontWeight: "600",
                              }}
                            >
                              <i className="ri-dashboard-line me-2"></i>
                              Owner Dashboard
                              <small
                                className="d-block mt-1"
                                style={{ opacity: 0.9 }}
                              >
                                Manage your rental business
                              </small>
                            </DropdownItem>
                            <DropdownItem divider />
                          </>
                        )}
                        <DropdownItem onClick={() => navigate("/profile")}>
                          <i className="ri-user-line me-2"></i> Profile
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate("/bookings")}>
                          <i className="ri-car-line me-2"></i> My Bookings
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate("/settings")}>
                          <i className="ri-settings-line me-2"></i> Settings
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem onClick={handleLogout}>
                          <i className="ri-logout-circle-line me-2"></i> Logout
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className=" d-flex align-items-center gap-1"
                    >
                      <i className="ri-login-circle-line"></i> Login
                    </Link>

                    <Link
                      to="/register"
                      className=" d-flex align-items-center gap-1"
                    >
                      <i className="ri-user-line"></i> Register
                    </Link>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* =============== header middle =========== */}
      <div className="header__middle">
        <Container>
          <Row>
            <Col lg="4" md="3" sm="4">
              <div className="logo">
                <h1>
                  <Link to="/home" className=" d-flex align-items-center gap-2">
                    <i className="ri-car-line"></i>
                    <span>
                      Auto Rent <br /> Da Nang
                    </span>
                  </Link>
                </h1>
              </div>
            </Col>

            <Col lg="3" md="3" sm="4">
              <div className="header__location d-flex align-items-center gap-2">
                <span>
                  <i className="ri-earth-line"></i>
                </span>
                <div className="header__location-content">
                  <h4>Viet Nam</h4>
                  <h6>Da Nang City, Viet Nam</h6>
                </div>
              </div>
            </Col>

            <Col lg="3" md="3" sm="4">
              <div className="header__location d-flex align-items-center gap-2">
                <span>
                  <i className="ri-time-line"></i>
                </span>
                <div className="header__location-content">
                  <h4>Sunday to Friday</h4>
                  <h6>10am - 7pm</h6>
                </div>
              </div>
            </Col>

            <Col
              lg="2"
              md="3"
              sm="0"
              className=" d-flex align-items-center justify-content-end "
            >
              <button className="header__btn btn ">
                <Link to="/contact">
                  <i className="ri-phone-line"></i> Request a call
                </Link>
              </button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ========== main navigation =========== */}

      <div className="main__navbar">
        <Container>
          <div className="navigation__wrapper d-flex align-items-center justify-content-between">
            <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}></i>
            </span>

            <div className="navigation" ref={menuRef} onClick={toggleMenu}>
              <div className="menu">
                {navLinks.map((item, index) => (
                  <NavLink
                    to={item.path}
                    className={(navClass) =>
                      navClass.isActive ? "nav__active nav__item" : "nav__item"
                    }
                    key={index}
                  >
                    {item.display}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="nav__right">
              <div className="search__box">
                <input type="text" placeholder="Search" />
                <span>
                  <i className="ri-search-line"></i>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Header;
