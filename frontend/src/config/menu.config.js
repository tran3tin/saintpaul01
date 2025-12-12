// src/config/menu.config.js

export const menuConfig = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "fas fa-home",
    path: "/dashboard",
    roles: [], // Empty = all roles can access
  },
  {
    id: "nu-tu",
    label: "Quản lý Nữ Tu",
    icon: "fas fa-users",
    roles: [],
    children: [
      {
        id: "nu-tu-list",
        label: "Danh sách Nữ Tu",
        icon: "fas fa-list",
        path: "/nu-tu",
      },
      {
        id: "nu-tu-create",
        label: "Thêm Nữ Tu mới",
        icon: "fas fa-user-plus",
        path: "/nu-tu/create",
      },
    ],
  },
  {
    id: "hanh-trinh",
    label: "Hành trình Ơn Gọi",
    icon: "fas fa-route",
    roles: [],
    children: [
      {
        id: "hanh-trinh-list",
        label: "Danh sách hành trình",
        icon: "fas fa-list",
        path: "/hanh-trinh",
      },
      {
        id: "hanh-trinh-create",
        label: "Thêm hành trình mới",
        icon: "fas fa-plus-circle",
        path: "/hanh-trinh/create",
      },
      {
        id: "hanh-trinh-timeline",
        label: "Timeline",
        icon: "fas fa-stream",
        path: "/hanh-trinh/timeline",
      },
    ],
  },
  {
    id: "cong-doan",
    label: "Quản lý Cộng Đoàn",
    icon: "fas fa-building",
    roles: [],
    children: [
      {
        id: "cong-doan-list",
        label: "Danh sách Cộng Đoàn",
        icon: "fas fa-list",
        path: "/cong-doan",
      },
      {
        id: "cong-doan-create",
        label: "Thêm Cộng Đoàn mới",
        icon: "fas fa-plus-circle",
        path: "/cong-doan/create",
      },
      {
        id: "cong-doan-assignment",
        label: "Bổ nhiệm chị em",
        icon: "fas fa-user-tag",
        path: "/cong-doan/assignment",
      },
      {
        id: "cong-doan-timeline",
        label: "Timeline Cộng Đoàn",
        icon: "fas fa-stream",
        path: "/cong-doan/timeline",
      },
    ],
  },
  {
    id: "hoc-van",
    label: "Học Vấn",
    icon: "fas fa-graduation-cap",
    roles: [],
    children: [
      {
        id: "hoc-van-list",
        label: "Danh sách học vấn",
        icon: "fas fa-list",
        path: "/hoc-van",
      },
      {
        id: "hoc-van-create",
        label: "Thêm học vấn mới",
        icon: "fas fa-plus-circle",
        path: "/hoc-van/create",
      },
      {
        id: "hoc-van-timeline",
        label: "Timeline Học Vấn",
        icon: "fas fa-stream",
        path: "/hoc-van/timeline",
      },
    ],
  },
  {
    id: "su-vu",
    label: "Sứ Vụ",
    icon: "fas fa-briefcase",
    roles: [],
    children: [
      {
        id: "su-vu-list",
        label: "Danh sách sứ vụ",
        icon: "fas fa-list",
        path: "/su-vu",
      },
      {
        id: "su-vu-create",
        label: "Thêm sứ vụ mới",
        icon: "fas fa-plus-circle",
        path: "/su-vu/create",
      },
      {
        id: "su-vu-timeline",
        label: "Timeline Sứ Vụ",
        icon: "fas fa-stream",
        path: "/su-vu/timeline",
      },
    ],
  },
  {
    id: "suc-khoe",
    label: "Sức Khỏe",
    icon: "fas fa-heartbeat",
    roles: [],
    children: [
      {
        id: "suc-khoe-list",
        label: "Hồ sơ sức khỏe",
        icon: "fas fa-notes-medical",
        path: "/suc-khoe",
      },
      {
        id: "suc-khoe-create",
        label: "Thêm hồ sơ mới",
        icon: "fas fa-plus-circle",
        path: "/suc-khoe/create",
      },
      {
        id: "suc-khoe-timeline",
        label: "Timeline Sức Khỏe",
        icon: "fas fa-stream",
        path: "/suc-khoe/timeline",
      },
      {
        id: "di-vang-list",
        label: "Quản lý đi vắng",
        icon: "fas fa-plane-departure",
        path: "/di-vang",
      },
      {
        id: "di-vang-create",
        label: "Đăng ký đi vắng",
        icon: "fas fa-plus-circle",
        path: "/di-vang/create",
      },
    ],
  },
  {
    id: "danh-gia",
    label: "Đánh Giá",
    icon: "fas fa-star",
    roles: ["admin", "be_tren_tong", "be_tren_cong_doan"],
    children: [
      {
        id: "danh-gia-list",
        label: "Danh sách đánh giá",
        icon: "fas fa-list",
        path: "/danh-gia",
      },
      {
        id: "danh-gia-create",
        label: "Tạo đánh giá mới",
        icon: "fas fa-plus-circle",
        path: "/danh-gia/create",
      },
      {
        id: "danh-gia-timeline",
        label: "Timeline Đánh Giá",
        icon: "fas fa-stream",
        path: "/danh-gia/timeline",
      },
    ],
  },
  {
    id: "bao-cao",
    label: "Báo Cáo & Thống Kê",
    icon: "fas fa-chart-bar",
    roles: [],
    children: [
      {
        id: "bao-cao-tong-quan",
        label: "Tổng quan",
        icon: "fas fa-chart-line",
        path: "/bao-cao",
      },
      {
        id: "bao-cao-list",
        label: "Danh sách báo cáo",
        icon: "fas fa-list",
        path: "/bao-cao/list",
      },
      {
        id: "bao-cao-tao-moi",
        label: "Tạo báo cáo mới",
        icon: "fas fa-plus-circle",
        path: "/bao-cao/generate",
      },
      {
        id: "bao-cao-nu-tu",
        label: "Báo cáo Nữ Tu",
        icon: "fas fa-user",
        path: "/bao-cao/nu-tu",
      },
      {
        id: "bao-cao-suc-khoe",
        label: "Báo cáo Sức Khỏe",
        icon: "fas fa-heartbeat",
        path: "/bao-cao/suc-khoe",
      },
      {
        id: "bao-cao-hanh-trinh",
        label: "Báo cáo Hành Trình",
        icon: "fas fa-route",
        path: "/bao-cao/hanh-trinh",
      },
    ],
  },
  {
    id: "divider-1",
    type: "divider",
  },
  {
    id: "label-admin",
    type: "label",
    label: "Quản trị",
    roles: ["admin", "superior_general"],
  },
  {
    id: "users",
    label: "Người dùng",
    icon: "fas fa-user-shield",
    roles: ["admin", "superior_general"],
    children: [
      {
        id: "users-list",
        label: "Danh sách người dùng",
        icon: "fas fa-list",
        path: "/users",
      },
      {
        id: "users-create",
        label: "Thêm người dùng",
        icon: "fas fa-user-plus",
        path: "/users/create",
      },
    ],
  },
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: "fas fa-id-card",
    path: "/profile",
    roles: [],
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: "fas fa-cog",
    roles: ["admin", "superior_general"],
    children: [
      {
        id: "settings-index",
        label: "Tổng quan cài đặt",
        icon: "fas fa-th-large",
        path: "/settings",
      },
      {
        id: "settings-general",
        label: "Cài đặt chung",
        icon: "fas fa-sliders-h",
        path: "/settings/general",
      },
      {
        id: "settings-system",
        label: "Cài đặt hệ thống",
        icon: "fas fa-server",
        path: "/settings/system",
      },
      {
        id: "settings-preferences",
        label: "Tùy chọn cá nhân",
        icon: "fas fa-user-cog",
        path: "/settings/preferences",
      },
      {
        id: "settings-backup",
        label: "Sao lưu & Khôi phục",
        icon: "fas fa-database",
        path: "/settings/backup",
      },
      {
        id: "settings-audit-log",
        label: "Nhật ký hệ thống",
        icon: "fas fa-history",
        path: "/settings/audit-log",
      },
    ],
  },
  {
    id: "divider-2",
    type: "divider",
  },
  {
    id: "help",
    label: "Trợ giúp",
    icon: "fas fa-question-circle",
    path: "/help",
    roles: [],
  },
];
