// Application Constants

// Giai đoạn Ơn Gọi (Vocation Stages)
export const VOCATION_STAGES = {
  TIM_HIEU: 'tim_hieu',
  NHA: 'nha',
  THINH_SINH: 'thinh_sinh',
  TAP_SINH: 'tap_sinh',
  KHAN_TAM: 'khan_tam',
  KHAN_TRONG: 'khan_trong',
};

export const VOCATION_STAGE_LABELS = {
  [VOCATION_STAGES.TIM_HIEU]: 'Tìm Hiểu',
  [VOCATION_STAGES.NHA]: 'Nhà',
  [VOCATION_STAGES.THINH_SINH]: 'Thỉnh Sinh',
  [VOCATION_STAGES.TAP_SINH]: 'Tập Sinh',
  [VOCATION_STAGES.KHAN_TAM]: 'Khấn Tạm',
  [VOCATION_STAGES.KHAN_TRONG]: 'Khấn Trọn',
};

export const VOCATION_STAGE_COLORS = {
  [VOCATION_STAGES.TIM_HIEU]: { bg: '#e3f2fd', color: '#1565c0' },
  [VOCATION_STAGES.NHA]: { bg: '#f3e5f5', color: '#6a1b9a' },
  [VOCATION_STAGES.THINH_SINH]: { bg: '#fff3e0', color: '#e65100' },
  [VOCATION_STAGES.TAP_SINH]: { bg: '#e8f5e9', color: '#2e7d32' },
  [VOCATION_STAGES.KHAN_TAM]: { bg: '#fce4ec', color: '#ad1457' },
  [VOCATION_STAGES.KHAN_TRONG]: { bg: '#e0f2f1', color: '#00695c' },
};

// Trình độ học vấn (Education Levels)
export const EDUCATION_LEVELS = {
  PRIMARY: 'tieu_hoc',
  SECONDARY: 'thcs',
  HIGH_SCHOOL: 'thpt',
  COLLEGE: 'cao_dang',
  BACHELOR: 'dai_hoc',
  MASTER: 'thac_si',
  DOCTOR: 'tien_si',
};

export const EDUCATION_LEVEL_LABELS = {
  [EDUCATION_LEVELS.PRIMARY]: 'Tiểu học',
  [EDUCATION_LEVELS.SECONDARY]: 'Trung học cơ sở',
  [EDUCATION_LEVELS.HIGH_SCHOOL]: 'Trung học phổ thông',
  [EDUCATION_LEVELS.COLLEGE]: 'Cao đẳng',
  [EDUCATION_LEVELS.BACHELOR]: 'Đại học',
  [EDUCATION_LEVELS.MASTER]: 'Thạc sĩ',
  [EDUCATION_LEVELS.DOCTOR]: 'Tiến sĩ',
};

// Vai trò người dùng (User Roles)
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SECRETARY: 'secretary',
  USER: 'user',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.MANAGER]: 'Quản lý',
  [USER_ROLES.SECRETARY]: 'Thư ký',
  [USER_ROLES.USER]: 'Người dùng',
};

// Trạng thái tài khoản (Account Status)
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.ACTIVE]: 'Hoạt động',
  [ACCOUNT_STATUS.INACTIVE]: 'Không hoạt động',
  [ACCOUNT_STATUS.PENDING]: 'Chờ duyệt',
  [ACCOUNT_STATUS.SUSPENDED]: 'Tạm khóa',
};

// Trạng thái nữ tu (Sister Status)
export const SISTER_STATUS = {
  ACTIVE: 'active',
  DEPARTED: 'departed',
  DECEASED: 'deceased',
  TRANSFERRED: 'transferred',
};

export const SISTER_STATUS_LABELS = {
  [SISTER_STATUS.ACTIVE]: 'Đang hoạt động',
  [SISTER_STATUS.DEPARTED]: 'Đã rời dòng',
  [SISTER_STATUS.DECEASED]: 'Đã qua đời',
  [SISTER_STATUS.TRANSFERRED]: 'Chuyển dòng',
};

// Loại sứ vụ (Mission Types)
export const MISSION_TYPES = {
  TEACHING: 'giang_day',
  HEALTHCARE: 'y_te',
  SOCIAL: 'xa_hoi',
  ADMINISTRATION: 'hanh_chinh',
  PASTORAL: 'muc_vu',
  OTHER: 'khac',
};

export const MISSION_TYPE_LABELS = {
  [MISSION_TYPES.TEACHING]: 'Giảng dạy',
  [MISSION_TYPES.HEALTHCARE]: 'Y tế',
  [MISSION_TYPES.SOCIAL]: 'Xã hội',
  [MISSION_TYPES.ADMINISTRATION]: 'Hành chính',
  [MISSION_TYPES.PASTORAL]: 'Mục vụ',
  [MISSION_TYPES.OTHER]: 'Khác',
};

// Lý do rời dòng (Departure Reasons)
export const DEPARTURE_REASONS = {
  PERSONAL: 'ca_nhan',
  HEALTH: 'suc_khoe',
  FAMILY: 'gia_dinh',
  OTHER: 'khac',
};

export const DEPARTURE_REASON_LABELS = {
  [DEPARTURE_REASONS.PERSONAL]: 'Lý do cá nhân',
  [DEPARTURE_REASONS.HEALTH]: 'Lý do sức khỏe',
  [DEPARTURE_REASONS.FAMILY]: 'Lý do gia đình',
  [DEPARTURE_REASONS.OTHER]: 'Lý do khác',
};

// Giới tính (Gender)
export const GENDER = {
  FEMALE: 'nu',
  MALE: 'nam',
};

export const GENDER_LABELS = {
  [GENDER.FEMALE]: 'Nữ',
  [GENDER.MALE]: 'Nam',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  LANGUAGE: 'language',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
