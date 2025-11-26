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
    path: "/nu-tu",
    roles: [],
    badge: {
      text: "150",
      color: "primary",
    },
  },
  {
    id: "hanh-trinh",
    label: "Hành trình Ơn Gọi",
    icon: "fas fa-route",
    roles: [],
    children: [
      {
        id: "hanh-trinh-filter",
        label: "Lọc theo giai đoạn",
        icon: "fas fa-filter",
        path: "/hanh-trinh/filter",
      },
      {
        id: "hanh-trinh-stats",
        label: "Thống kê",
        icon: "fas fa-chart-pie",
        path: "/hanh-trinh/stats",
      },
    ],
  },
  {
    id: "cong-doan",
    label: "Cộng Đoàn",
    icon: "fas fa-building",
    path: "/cong-doan",
    roles: [],
  },
  {
    id: "hoc-van",
    label: "Học Vấn",
    icon: "fas fa-graduation-cap",
    path: "/hoc-van",
    roles: [],
  },
  {
    id: "su-vu",
    label: "Sứ Vụ",
    icon: "fas fa-briefcase",
    path: "/su-vu",
    roles: [],
  },
  {
    id: "suc-khoe",
    label: "Sức Khỏe",
    icon: "fas fa-heartbeat",
    path: "/suc-khoe",
    roles: [],
  },
  {
    id: "danh-gia",
    label: "Đánh Giá",
    icon: "fas fa-star",
    path: "/danh-gia",
    roles: ["admin", "be_tren_tong", "be_tren_cong_doan"],
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
        id: "bao-cao-do-tuoi",
        label: "Theo độ tuổi",
        icon: "fas fa-birthday-cake",
        path: "/bao-cao/do-tuoi",
      },
      {
        id: "bao-cao-giai-doan",
        label: "Theo giai đoạn",
        icon: "fas fa-layer-group",
        path: "/bao-cao/giai-doan",
      },
      {
        id: "bao-cao-cong-doan",
        label: "Theo cộng đoàn",
        icon: "fas fa-building",
        path: "/bao-cao/cong-doan",
      },
      {
        id: "bao-cao-su-vu",
        label: "Theo sứ vụ",
        icon: "fas fa-briefcase",
        path: "/bao-cao/su-vu",
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
    roles: ["admin"],
  },
  {
    id: "users",
    label: "Người dùng",
    icon: "fas fa-user-shield",
    path: "/users",
    roles: ["admin"],
    badge: {
      text: "Admin",
      color: "danger",
    },
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: "fas fa-cog",
    path: "/settings",
    roles: ["admin", "be_tren_tong"],
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
  {
    id: "new-feature",
    label: "Tính năng mới",
    icon: "fas fa-star",
    path: "/new-feature",
    roles: ["admin"], // Chỉ admin mới thấy
    badge: {
      text: "New",
      color: "success",
    },
  },
  {
    id: "reports",
    label: "Báo cáo",
    icon: "fas fa-file-alt",
    roles: [],
    children: [
      {
        id: "report-1",
        label: "Báo cáo 1",
        icon: "fas fa-file",
        path: "/reports/report-1",
      },
      {
        id: "report-2",
        label: "Báo cáo 2",
        icon: "fas fa-file",
        path: "/reports/report-2",
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
    label: "Quản trị hệ thống",
    roles: ["admin"],
  },
];
