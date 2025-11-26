import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-church"></i>
            </div>
            <h1 className="auth-title">Hội Dòng OSP</h1>
            <p className="auth-subtitle">Hệ thống Quản lý Nhân sự</p>
          </div>
          <div className="auth-content">
            <Outlet />
          </div>
        </div>
        <div className="auth-footer">
          <p>&copy; 2025 Hội Dòng OSP. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
