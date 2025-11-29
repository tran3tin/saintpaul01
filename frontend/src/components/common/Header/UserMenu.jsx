import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debug: Log user prop
  console.log("UserMenu received user:", user);

  // If user has password field, it's form data - clear localStorage and redirect
  if (user && user.password !== undefined) {
    console.error("❌ UserMenu received form data instead of user data!", user);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null; // Don't render anything
  }

  // If user is null/undefined, show minimal UI
  if (!user) {
    return (
      <div className="user-menu-dropdown dropdown" ref={dropdownRef}>
        <button type="button" className="user-menu-toggle btn btn-link">
          <div className="user-info d-flex align-items-center">
            <img
              src="https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=40&bold=true"
              alt="User"
              className="user-avatar"
            />
          </div>
        </button>
      </div>
    );
  }

  // Get user role label
  const getRoleLabel = (role) => {
    if (!role || typeof role !== 'string') return "Người dùng";
    const roles = {
      admin: "Quản trị viên",
      be_tren_tong: "Bề Trên Tổng",
      thu_ky: "Thư ký",
      be_tren_cong_doan: "Bề Trên Cộng Đoàn",
      user: "Người dùng",
    };
    return roles[role] || "Người dùng";
  };

  // Safe string getter - ensures we always return a string
  const safeString = (value, defaultValue = "") => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue; // Don't render objects
  };

  const userName = safeString(user.full_name) || safeString(user.username) || "User";
  const userEmail = safeString(user.email);
  const userRole = safeString(user.role, "user");

  // Get avatar URL
  const getAvatar = () => {
    if (user.avatar && typeof user.avatar === 'string') {
      return user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=667eea&color=fff&size=40&bold=true`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className={`user-menu-dropdown dropdown ${isOpen ? 'show' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className="user-menu-toggle btn btn-link"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <div className="user-info d-flex align-items-center">
          <img
            src={getAvatar()}
            alt={userName}
            className="user-avatar"
          />
          <div className="user-details d-none d-lg-block ms-2">
            <div className="user-name">{userName}</div>
            <div className="user-role">{getRoleLabel(userRole)}</div>
          </div>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} ms-2 d-none d-lg-inline`}></i>
        </div>
      </button>

      <div className={`dropdown-menu user-menu-dropdown-menu ${isOpen ? 'show' : ''}`}>
        {/* User Info Header */}
        <div className="dropdown-header">
          <div className="d-flex align-items-center">
            <img
              src={getAvatar()}
              alt={userName}
              className="user-avatar-large"
            />
            <div className="ms-3">
              <div className="user-name-large">{userName}</div>
              <div className="user-email">{userEmail}</div>
              <div className="user-role-badge">
                <span className="badge bg-light text-dark">
                  {getRoleLabel(userRole)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        {/* Menu Items */}
        <Link to="/profile" className="dropdown-item" onClick={handleItemClick}>
          <i className="fas fa-user me-2"></i>
          Thông tin cá nhân
        </Link>

        <Link to="/settings" className="dropdown-item" onClick={handleItemClick}>
          <i className="fas fa-cog me-2"></i>
          Cài đặt
        </Link>

        <Link to="/settings/preferences" className="dropdown-item" onClick={handleItemClick}>
          <i className="fas fa-key me-2"></i>
          Đổi mật khẩu
        </Link>

        <div className="dropdown-divider"></div>

        {/* Help & Support */}
        <Link to="/help" className="dropdown-item" onClick={handleItemClick}>
          <i className="fas fa-question-circle me-2"></i>
          Trợ giúp
        </Link>

        <div className="dropdown-divider"></div>

        {/* Logout */}
        <button type="button" className="dropdown-item text-danger" onClick={handleLogoutClick}>
          <i className="fas fa-sign-out-alt me-2"></i>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
