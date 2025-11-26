// API Endpoints
const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },
  
  // Sisters (Nữ Tu)
  SISTERS: {
    BASE: '/sisters',
    GET_ALL: '/sisters',
    GET_BY_ID: (id) => `/sisters/${id}`,
    CREATE: '/sisters',
    UPDATE: (id) => `/sisters/${id}`,
    DELETE: (id) => `/sisters/${id}`,
    UPLOAD_PHOTO: (id) => `/sisters/${id}/photo`,
    SEARCH: '/sisters/search',
    EXPORT: '/sisters/export',
    STATISTICS: '/sisters/statistics',
  },
  
  // Vocation Journey (Hành trình Ơn Gọi)
  VOCATION: {
    BASE: '/vocation-journey',
    GET_ALL: '/vocation-journey',
    GET_BY_SISTER: (sisterId) => `/vocation-journey/sister/${sisterId}`,
    GET_BY_ID: (id) => `/vocation-journey/${id}`,
    CREATE: '/vocation-journey',
    UPDATE: (id) => `/vocation-journey/${id}`,
    DELETE: (id) => `/vocation-journey/${id}`,
    FILTER_BY_STAGE: '/vocation-journey/filter/stage',
    TIMELINE: (sisterId) => `/vocation-journey/timeline/${sisterId}`,
  },
  
  // Communities (Cộng Đoàn)
  COMMUNITIES: {
    BASE: '/communities',
    GET_ALL: '/communities',
    GET_BY_ID: (id) => `/communities/${id}`,
    CREATE: '/communities',
    UPDATE: (id) => `/communities/${id}`,
    DELETE: (id) => `/communities/${id}`,
    GET_MEMBERS: (id) => `/communities/${id}/members`,
  },
  
  // Community Assignments (Phân Công Cộng Đoàn)
  ASSIGNMENTS: {
    BASE: '/community-assignments',
    GET_ALL: '/community-assignments',
    GET_BY_SISTER: (sisterId) => `/community-assignments/sister/${sisterId}`,
    CREATE: '/community-assignments',
    UPDATE: (id) => `/community-assignments/${id}`,
    DELETE: (id) => `/community-assignments/${id}`,
  },
  
  // Education (Học Vấn)
  EDUCATION: {
    BASE: '/education',
    GET_ALL: '/education',
    GET_BY_SISTER: (sisterId) => `/education/sister/${sisterId}`,
    GET_BY_ID: (id) => `/education/${id}`,
    CREATE: '/education',
    UPDATE: (id) => `/education/${id}`,
    DELETE: (id) => `/education/${id}`,
  },
  
  // Training Courses (Khóa Đào Tạo)
  TRAINING: {
    BASE: '/training-courses',
    GET_ALL: '/training-courses',
    GET_BY_SISTER: (sisterId) => `/training-courses/sister/${sisterId}`,
    CREATE: '/training-courses',
    UPDATE: (id) => `/training-courses/${id}`,
    DELETE: (id) => `/training-courses/${id}`,
  },
  
  // Missions (Sứ Vụ)
  MISSIONS: {
    BASE: '/missions',
    GET_ALL: '/missions',
    GET_BY_SISTER: (sisterId) => `/missions/sister/${sisterId}`,
    GET_BY_ID: (id) => `/missions/${id}`,
    CREATE: '/missions',
    UPDATE: (id) => `/missions/${id}`,
    DELETE: (id) => `/missions/${id}`,
  },
  
  // Health Records (Sức Khỏe)
  HEALTH: {
    BASE: '/health-records',
    GET_ALL: '/health-records',
    GET_BY_SISTER: (sisterId) => `/health-records/sister/${sisterId}`,
    CREATE: '/health-records',
    UPDATE: (id) => `/health-records/${id}`,
    DELETE: (id) => `/health-records/${id}`,
  },
  
  // Evaluations (Đánh Giá)
  EVALUATIONS: {
    BASE: '/evaluations',
    GET_ALL: '/evaluations',
    GET_BY_SISTER: (sisterId) => `/evaluations/sister/${sisterId}`,
    CREATE: '/evaluations',
    UPDATE: (id) => `/evaluations/${id}`,
    DELETE: (id) => `/evaluations/${id}`,
  },
  
  // Reports (Báo Cáo)
  REPORTS: {
    OVERVIEW: '/reports/overview',
    BY_AGE: '/reports/by-age',
    BY_STAGE: '/reports/by-stage',
    BY_COMMUNITY: '/reports/by-community',
    BY_MISSION: '/reports/by-mission',
    EXPORT_PDF: '/reports/export/pdf',
    EXPORT_EXCEL: '/reports/export/excel',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
  },
  
  // Audit Logs
  AUDIT: {
    GET_ALL: '/audit-logs',
    GET_BY_ID: (id) => `/audit-logs/${id}`,
  },
  
  // Departure Records (Rời Dòng)
  DEPARTURE: {
    BASE: '/departure-records',
    GET_ALL: '/departure-records',
    GET_BY_ID: (id) => `/departure-records/${id}`,
    CREATE: '/departure-records',
    UPDATE: (id) => `/departure-records/${id}`,
  },
};

export default API_ENDPOINTS;
