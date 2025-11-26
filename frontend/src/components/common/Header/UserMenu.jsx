import React from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

const UserMenu = ({ user, onLogout }) => {
  // Get user role label
  const getRoleLabel = (role) => {
    const roles = {
      admin: "Quản trị viên",
      be_tren_tong: "Bề Trên Tổng",
      thu_ky: "Thư ký",
      be_tren_cong_doan: "Bề Trên Cộng Đoàn",
      user: "Người dùng",
    };
    return roles[role] || "Người dùng";
  };

  // Get avatar URL or generate initials
  const getAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    // Generate avatar from name
    const name = user?.full_name || user?.username || "U";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=667eea&color=fff&size=40&bold=true`;
  };

  return (
    <Dropdown align="end" className="user-menu-dropdown">
      <Dropdown.Toggle
        variant="link"
        id="user-menu-dropdown"
        className="user-menu-toggle"
      >
        <div className="user-info d-flex align-items-center">
          <img
            src={getAvatar()}
            alt={user?.full_name || user?.username}
            className="user-avatar"
          />
          <div className="user-details d-none d-lg-block ms-2">
            <div className="user-name">{user?.full_name || user?.username}</div>
            <div className="user-role">{getRoleLabel(user?.role)}</div>
          </div>
          <i className="fas fa-chevron-down ms-2 d-none d-lg-inline"></i>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="user-menu-dropdown-menu">
        {/* User Info Header */}
        <div className="dropdown-header">
          <div className="d-flex align-items-center">
            <img
              src={getAvatar()}
              alt={user?.full_name || user?.username}
              className="user-avatar-large"
            />
            <div className="ms-3">
              <div className="user-name-large">
                {user?.full_name || user?.username}
              </div>
              <div className="user-email">{user?.email}</div>
              <div className="user-role-badge">
                <span className="badge bg-primary">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Dropdown.Divider />

        {/* Menu Items */}
        <Dropdown.Item as={Link} to="/profile">
          <i className="fas fa-user me-2"></i>
          Thông tin cá nhân
        </Dropdown.Item>

        <Dropdown.Item as={Link} to="/settings">
          <i className="fas fa-cog me-2"></i>
          Cài đặt
        </Dropdown.Item>

        <Dropdown.Item as={Link} to="/settings/change-password">
          <i className="fas fa-key me-2"></i>
          Đổi mật khẩu
        </Dropdown.Item>

        <Dropdown.Divider />

        {/* Help & Support */}
        <Dropdown.Item as={Link} to="/help">
          <i className="fas fa-question-circle me-2"></i>
          Trợ giúp
        </Dropdown.Item>

        <Dropdown.Item as={Link} to="/about">
          <i className="fas fa-info-circle me-2"></i>
          Về hệ thống
        </Dropdown.Item>

        <Dropdown.Divider />

        {/* Logout */}
        <Dropdown.Item onClick={onLogout} className="text-danger">
          <i className="fas fa-sign-out-alt me-2"></i>
          Đăng xuất
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
