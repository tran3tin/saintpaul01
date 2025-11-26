import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import EmptyLayout from '../layouts/EmptyLayout';

// Route wrappers
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';

// Dashboard
import DashboardPage from '../features/dashboard/pages/DashboardPage';

// Nu Tu pages
import NuTuListPage from '../features/nu-tu/pages/NuTuListPage';
import NuTuCreatePage from '../features/nu-tu/pages/NuTuCreatePage';
import NuTuEditPage from '../features/nu-tu/pages/NuTuEditPage';
import NuTuDetailPage from '../features/nu-tu/pages/NuTuDetailPage';

// Hanh Trinh pages
import HanhTrinhListPage from '../features/hanh-trinh/pages/HanhTrinhListPage';
import TimelinePage from '../features/hanh-trinh/pages/TimelinePage';
import FilterByStagePage from '../features/hanh-trinh/pages/FilterByStagePage';

// Cong Doan pages
import CongDoanListPage from '../features/cong-doan/pages/CongDoanListPage';
import CongDoanDetailPage from '../features/cong-doan/pages/CongDoanDetailPage';

// Bao Cao pages
import BaoCaoPage from '../features/bao-cao/pages/BaoCaoPage';

// Settings pages
import SettingsPage from '../features/settings/pages/SettingsPage';

// Users pages
import UserListPage from '../features/users/pages/UserListPage';
import ProfilePage from '../features/users/pages/ProfilePage';

// Error pages
const NotFoundPage = () => (
  <div className="error-page">
    <h1>404</h1>
    <p>Trang không tồn tại</p>
    <a href="/">Về trang chủ</a>
  </div>
);

const UnauthorizedPage = () => (
  <div className="error-page">
    <h1>403</h1>
    <p>Bạn không có quyền truy cập trang này</p>
    <a href="/">Về trang chủ</a>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  // Auth routes (public)
  {
    element: (
      <PublicRoute restricted>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  
  // Main routes (private)
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      // Dashboard
      {
        path: '/',
        element: <DashboardPage />,
      },
      
      // Nữ Tu
      {
        path: '/nu-tu',
        children: [
          {
            index: true,
            element: <NuTuListPage />,
          },
          {
            path: 'them-moi',
            element: <NuTuCreatePage />,
          },
          {
            path: ':id',
            element: <NuTuDetailPage />,
          },
          {
            path: ':id/chinh-sua',
            element: <NuTuEditPage />,
          },
        ],
      },
      
      // Hành trình Ơn Gọi
      {
        path: '/hanh-trinh',
        children: [
          {
            index: true,
            element: <HanhTrinhListPage />,
          },
          {
            path: 'timeline/:sisterId',
            element: <TimelinePage />,
          },
          {
            path: 'loc-giai-doan',
            element: <FilterByStagePage />,
          },
        ],
      },
      
      // Cộng Đoàn
      {
        path: '/cong-doan',
        children: [
          {
            index: true,
            element: <CongDoanListPage />,
          },
          {
            path: ':id',
            element: <CongDoanDetailPage />,
          },
        ],
      },
      
      // Báo cáo
      {
        path: '/bao-cao',
        element: <BaoCaoPage />,
      },
      
      // Users
      {
        path: '/users',
        element: (
          <PrivateRoute requiredRoles={['super_admin', 'admin']}>
            <UserListPage />
          </PrivateRoute>
        ),
      },
      
      // Profile
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      
      // Settings
      {
        path: '/cai-dat',
        element: <SettingsPage />,
      },
    ],
  },
  
  // Error routes
  {
    element: <EmptyLayout />,
    children: [
      {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: '/404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

export default router;
