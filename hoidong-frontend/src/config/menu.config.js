// Sidebar Menu Configuration
const menuConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'fas fa-home',
    path: '/',
    permission: null,
  },
  {
    id: 'nu-tu',
    title: 'Quản lý Nữ Tu',
    icon: 'fas fa-users',
    path: '/nu-tu',
    permission: 'sisters:read',
    submenu: [
      { id: 'nu-tu-list', title: 'Danh sách Nữ Tu', path: '/nu-tu' },
      { id: 'nu-tu-create', title: 'Thêm Nữ Tu mới', path: '/nu-tu/them-moi', permission: 'sisters:create' },
    ],
  },
  {
    id: 'hanh-trinh',
    title: 'Hành trình Ơn Gọi',
    icon: 'fas fa-route',
    path: '/hanh-trinh',
    permission: 'vocation:read',
    submenu: [
      { id: 'hanh-trinh-list', title: 'Danh sách hành trình', path: '/hanh-trinh' },
      { id: 'hanh-trinh-filter', title: 'Lọc theo giai đoạn', path: '/hanh-trinh/loc-giai-doan' },
      { id: 'hanh-trinh-timeline', title: 'Timeline', path: '/hanh-trinh/timeline' },
    ],
  },
  {
    id: 'cong-doan',
    title: 'Cộng Đoàn',
    icon: 'fas fa-building',
    path: '/cong-doan',
    permission: 'communities:read',
    submenu: [
      { id: 'cong-doan-list', title: 'Danh sách Cộng đoàn', path: '/cong-doan' },
      { id: 'cong-doan-create', title: 'Thêm Cộng đoàn', path: '/cong-doan/them-moi', permission: 'communities:create' },
    ],
  },
  {
    id: 'hoc-van',
    title: 'Học Vấn',
    icon: 'fas fa-graduation-cap',
    path: '/hoc-van',
    permission: 'education:read',
  },
  {
    id: 'su-vu',
    title: 'Sứ Vụ',
    icon: 'fas fa-briefcase',
    path: '/su-vu',
    permission: 'missions:read',
  },
  {
    id: 'suc-khoe',
    title: 'Sức Khỏe',
    icon: 'fas fa-heartbeat',
    path: '/suc-khoe',
    permission: 'health:read',
  },
  {
    id: 'danh-gia',
    title: 'Đánh Giá',
    icon: 'fas fa-star',
    path: '/danh-gia',
    permission: 'evaluations:read',
  },
  {
    id: 'bao-cao',
    title: 'Báo Cáo & Thống Kê',
    icon: 'fas fa-chart-bar',
    path: '/bao-cao',
    permission: 'reports:read',
    submenu: [
      { id: 'bao-cao-tong-hop', title: 'Báo cáo tổng hợp', path: '/bao-cao' },
      { id: 'thong-ke-do-tuoi', title: 'Thống kê độ tuổi', path: '/bao-cao/do-tuoi' },
      { id: 'thong-ke-giai-doan', title: 'Thống kê giai đoạn', path: '/bao-cao/giai-doan' },
      { id: 'thong-ke-cong-doan', title: 'Thống kê cộng đoàn', path: '/bao-cao/cong-doan' },
    ],
  },
  {
    id: 'divider-1',
    divider: true,
  },
  {
    id: 'users',
    title: 'Quản lý Người dùng',
    icon: 'fas fa-user-cog',
    path: '/users',
    permission: 'users:read',
  },
  {
    id: 'settings',
    title: 'Cài Đặt',
    icon: 'fas fa-cog',
    path: '/cai-dat',
    permission: 'settings:read',
  },
];

export default menuConfig;
