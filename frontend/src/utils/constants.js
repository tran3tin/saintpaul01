// src/utils/constants.js

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

/**
 * File Upload
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

/**
 * Journey Stages (Giai đoạn hành trình ơn gọi)
 * Thứ tự từ Tìm hiểu đến Đã qua đời
 */
export const JOURNEY_STAGES = {
  INQUIRY: "inquiry", // 1. Tìm hiểu
  ASPIRANT: "aspirant", // 2. Ứng sinh
  POSTULANT: "postulant", // 3. Thỉnh sinh
  NOVICE: "novice", // 4. Tập viện
  TEMPORARY_VOWS: "temporary_vows", // 5. Khấn tạm
  PERPETUAL_VOWS: "perpetual_vows", // 6. Khấn trọn
  // Trạng thái đặc biệt (gộp từ SISTER_STATUS)
  LEAVE: "leave", // 7. Đã rời dòng
  DECEASED: "deceased", // 8. Đã qua đời
};

export const JOURNEY_STAGE_LABELS = {
  [JOURNEY_STAGES.INQUIRY]: "Tìm hiểu",
  [JOURNEY_STAGES.ASPIRANT]: "Ứng sinh",
  [JOURNEY_STAGES.POSTULANT]: "Thỉnh sinh",
  [JOURNEY_STAGES.NOVICE]: "Tập viện",
  [JOURNEY_STAGES.TEMPORARY_VOWS]: "Khấn tạm",
  [JOURNEY_STAGES.PERPETUAL_VOWS]: "Khấn trọn",
  [JOURNEY_STAGES.LEAVE]: "Đã rời dòng",
  [JOURNEY_STAGES.DECEASED]: "Đã qua đời",
  // Legacy mappings for backward compatibility
  left: "Đã rời dòng",
  active: "Đang hoạt động",
  inactive: "Tạm nghỉ",
};

export const JOURNEY_STAGE_COLORS = {
  [JOURNEY_STAGES.INQUIRY]: "#6c757d",
  [JOURNEY_STAGES.ASPIRANT]: "#17a2b8",
  [JOURNEY_STAGES.POSTULANT]: "#ffc107",
  [JOURNEY_STAGES.NOVICE]: "#fd7e14",
  [JOURNEY_STAGES.TEMPORARY_VOWS]: "#6f42c1",
  [JOURNEY_STAGES.PERPETUAL_VOWS]: "#28a745",
  [JOURNEY_STAGES.LEAVE]: "#dc3545",
  [JOURNEY_STAGES.DECEASED]: "#343a40",
};

// Thứ tự hiển thị giai đoạn
export const JOURNEY_STAGE_ORDER = [
  JOURNEY_STAGES.INQUIRY,
  JOURNEY_STAGES.ASPIRANT,
  JOURNEY_STAGES.POSTULANT,
  JOURNEY_STAGES.NOVICE,
  JOURNEY_STAGES.TEMPORARY_VOWS,
  JOURNEY_STAGES.PERPETUAL_VOWS,
  JOURNEY_STAGES.LEAVE,
  JOURNEY_STAGES.DECEASED,
];

/**
 * Sister Status (Legacy - kept for backward compatibility)
 * Được gộp vào JOURNEY_STAGES
 */
export const SISTER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  LEAVE: "leave",
  DECEASED: "deceased",
};

export const SISTER_STATUS_LABELS = {
  [SISTER_STATUS.ACTIVE]: "Đang hoạt động",
  [SISTER_STATUS.INACTIVE]: "Tạm nghỉ",
  [SISTER_STATUS.LEAVE]: "Đã rời dòng",
  [SISTER_STATUS.DECEASED]: "Đã qua đời",
};

export const SISTER_STATUS_COLORS = {
  [SISTER_STATUS.ACTIVE]: "success",
  [SISTER_STATUS.INACTIVE]: "warning",
  [SISTER_STATUS.LEAVE]: "secondary",
  [SISTER_STATUS.DECEASED]: "dark",
};

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  SUPERIOR_GENERAL: "be_tren_tong",
  SUPERIOR_COMMUNITY: "be_tren_cong_doan",
  SECRETARY: "thu_ky",
  MEMBER: "thanh_vien",
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Quản trị viên",
  [USER_ROLES.SUPERIOR_GENERAL]: "Bề trên Tổng",
  [USER_ROLES.SUPERIOR_COMMUNITY]: "Bề trên Cộng đoàn",
  [USER_ROLES.SECRETARY]: "Thư ký",
  [USER_ROLES.MEMBER]: "Thành viên",
};

/**
 * Education Levels
 */
export const EDUCATION_LEVELS = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  HIGH_SCHOOL: "high_school",
  COLLEGE: "college",
  UNIVERSITY: "university",
  MASTER: "master",
  DOCTORATE: "doctorate",
};

export const EDUCATION_LEVEL_LABELS = {
  [EDUCATION_LEVELS.PRIMARY]: "Tiểu học",
  [EDUCATION_LEVELS.SECONDARY]: "Trung học cơ sở",
  [EDUCATION_LEVELS.HIGH_SCHOOL]: "Trung học phổ thông",
  [EDUCATION_LEVELS.COLLEGE]: "Cao đẳng",
  [EDUCATION_LEVELS.UNIVERSITY]: "Đại học",
  [EDUCATION_LEVELS.MASTER]: "Thạc sĩ",
  [EDUCATION_LEVELS.DOCTORATE]: "Tiến sĩ",
};

/**
 * Health Status
 */
export const HEALTH_STATUS = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
};

export const HEALTH_STATUS_LABELS = {
  [HEALTH_STATUS.EXCELLENT]: "Xuất sắc",
  [HEALTH_STATUS.GOOD]: "Tốt",
  [HEALTH_STATUS.FAIR]: "Trung bình",
  [HEALTH_STATUS.POOR]: "Kém",
};

export const HEALTH_STATUS_COLORS = {
  [HEALTH_STATUS.EXCELLENT]: "success",
  [HEALTH_STATUS.GOOD]: "info",
  [HEALTH_STATUS.FAIR]: "warning",
  [HEALTH_STATUS.POOR]: "danger",
};

/**
 * Mission Types
 */
export const MISSION_TYPES = {
  EDUCATION: "education",
  HEALTHCARE: "healthcare",
  SOCIAL: "social",
  PASTORAL: "pastoral",
  ADMINISTRATION: "administration",
  OTHER: "other",
};

export const MISSION_TYPE_LABELS = {
  [MISSION_TYPES.EDUCATION]: "Giáo dục",
  [MISSION_TYPES.HEALTHCARE]: "Y tế",
  [MISSION_TYPES.SOCIAL]: "Xã hội",
  [MISSION_TYPES.PASTORAL]: "Mục vụ",
  [MISSION_TYPES.ADMINISTRATION]: "Hành chính",
  [MISSION_TYPES.OTHER]: "Khác",
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "DD/MM/YYYY HH:mm",
  FULL: "dddd, DD/MM/YYYY HH:mm",
  API: "YYYY-MM-DD",
  MONTH_YEAR: "MM/YYYY",
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  SIDEBAR_COLLAPSED: "sidebarCollapsed",
  SIDEBAR_EXPANDED_GROUPS: "sidebarExpandedGroups",
  TABLE_PAGE_SIZE: "tablePageSize",
};

/**
 * Toast Messages
 */
export const TOAST_MESSAGES = {
  SUCCESS: {
    CREATE: "Tạo mới thành công!",
    UPDATE: "Cập nhật thành công!",
    DELETE: "Xóa thành công!",
    SAVE: "Lưu thành công!",
  },
  ERROR: {
    CREATE: "Tạo mới thất bại!",
    UPDATE: "Cập nhật thất bại!",
    DELETE: "Xóa thất bại!",
    SAVE: "Lưu thất bại!",
    NETWORK: "Lỗi kết nối mạng!",
    UNKNOWN: "Có lỗi xảy ra!",
  },
  WARNING: {
    UNSAVED_CHANGES: "Bạn có thay đổi chưa lưu!",
    CONFIRM_DELETE: "Bạn có chắc chắn muốn xóa?",
  },
};

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: "Trường này là bắt buộc",
  INVALID_EMAIL: "Email không hợp lệ",
  INVALID_PHONE: "Số điện thoại không hợp lệ",
  INVALID_DATE: "Ngày không hợp lệ",
  INVALID_DATE_RANGE: "Khoảng thời gian không hợp lệ",
  MIN_LENGTH: (min) => `Tối thiểu ${min} ký tự`,
  MAX_LENGTH: (max) => `Tối đa ${max} ký tự`,
  MIN_VALUE: (min) => `Giá trị tối thiểu là ${min}`,
  MAX_VALUE: (max) => `Giá trị tối đa là ${max}`,
  PASSWORD_WEAK: "Mật khẩu quá yếu",
  PASSWORD_MISMATCH: "Mật khẩu không khớp",
};

/**
 * Chart Colors
 */
export const CHART_COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#4facfe",
  "#43e97b",
  "#fa709a",
  "#fee140",
  "#30cfd0",
  "#a8edea",
  "#fed6e3",
];

/**
 * Age Groups
 */
export const AGE_GROUPS = [
  { min: 0, max: 30, label: "Dưới 30 tuổi" },
  { min: 30, max: 40, label: "30-40 tuổi" },
  { min: 40, max: 50, label: "40-50 tuổi" },
  { min: 50, max: 60, label: "50-60 tuổi" },
  { min: 60, max: 70, label: "60-70 tuổi" },
  { min: 70, max: 999, label: "Trên 70 tuổi" },
];
