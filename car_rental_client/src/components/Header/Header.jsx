import React, { useRef, useState } from "react";

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

const navLinks = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/about",
    display: "About",
  },
  {
    path: "/cars",
    display: "Cars",
  },

  {
    path: "/blogs",
    display: "Blog",
  },
  {
    path: "/contact",
    display: "Contact",
  },
];

const Header = () => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Debug log
  console.log("Header - isAuthenticated:", isAuthenticated);
  console.log("Header - user:", user);

  const toggleMenu = () => menuRef.current.classList.toggle("menu__active");
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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

  return (
    <header className="header">
      {/* ============ header top ============ */}
      <div className="header__top">
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              <div className="header__top__left">
                <span>Need Help?</span>
                <span className="header__top__help">
                  <i class="ri-phone-fill"></i> +84-914-048-099
                </span>
              </div>
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="header__top__right d-flex align-items-center justify-content-end gap-3">
                {isAuthenticated && user ? (
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
                        {/* Trust Point Badge */}
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
                      <DropdownItem onClick={() => navigate("/profile")}>
                        <i className="ri-user-line me-2"></i>
                        Profile
                      </DropdownItem>
                      <DropdownItem onClick={() => navigate("/bookings")}>
                        <i className="ri-car-line me-2"></i>
                        My Bookings
                      </DropdownItem>
                      <DropdownItem onClick={() => navigate("/settings")}>
                        <i className="ri-settings-line me-2"></i>
                        Settings
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={handleLogout}>
                        <i className="ri-logout-circle-line me-2"></i>
                        Logout
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
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
                    <i class="ri-car-line"></i>
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
                  <i class="ri-earth-line"></i>
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
                  <i class="ri-time-line"></i>
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
                  <i class="ri-phone-line"></i> Request a call
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
              <i class="ri-menu-line" onClick={toggleMenu}></i>
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
                  <i class="ri-search-line"></i>
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
