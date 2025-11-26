import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, sidebarCollapsed } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <i className={`fas fa-${sidebarCollapsed ? 'bars' : 'times'}`}></i>
        </button>
        
        <div className="header-search d-none d-md-flex">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <Dropdown className="header-dropdown">
          <Dropdown.Toggle as="button" className="header-icon-btn">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" className="notification-menu">
            <div className="dropdown-header">
              <span>Thông báo</span>
              <Link to="/thong-bao">Xem tất cả</Link>
            </div>
            <Dropdown.Divider />
            <div className="notification-item">
              <div className="notification-icon bg-primary">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="notification-content">
                <p>Nữ tu mới được thêm vào hệ thống</p>
                <small>5 phút trước</small>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon bg-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="notification-content">
                <p>Cập nhật hành trình ơn gọi thành công</p>
                <small>1 giờ trước</small>
              </div>
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* User Menu */}
        <Dropdown className="header-dropdown user-dropdown">
          <Dropdown.Toggle as="button" className="user-menu-toggle">
            <div className="user-avatar">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=667eea&color=fff`}
                alt={user?.full_name}
              />
            </div>
            <div className="user-info d-none d-md-block">
              <span className="user-name">{user?.full_name || 'Người dùng'}</span>
              <span className="user-role">{user?.role || 'User'}</span>
            </div>
            <i className="fas fa-chevron-down d-none d-md-block"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <div className="dropdown-user-info">
              <strong>{user?.full_name}</strong>
              <small>{user?.email}</small>
            </div>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to="/profile">
              <i className="fas fa-user"></i> Hồ sơ cá nhân
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/cai-dat">
              <i className="fas fa-cog"></i> Cài đặt
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
