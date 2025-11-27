// src/services/apiEndpoints.js

export const API_ENDPOINTS = {
  // ============================================
  // AUTH
  // ============================================
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // ============================================
  // SISTER (NỮ TU)
  // ============================================
  SISTER: {
    LIST: "/sisters",
    CREATE: "/sisters",
    DETAIL: (id) => `/sisters/${id}`,
    UPDATE: (id) => `/sisters/${id}`,
    DELETE: (id) => `/sisters/${id}`,
    SEARCH: "/sisters/search",
    EXPORT: "/sisters/export",
    IMPORT: "/sisters/import",
    STATISTICS: "/sisters/statistics",
    UPLOAD_AVATAR: (id) => `/sisters/${id}/avatar`,
  },

  // ============================================
  // MISSION (HÀNH TRÌNH/SỨ VỤ)
  // ============================================
  MISSION: {
    // Journey (Hành trình ơn gọi)
    JOURNEY: {
      LIST: (sisterId) => `/missions/journey/${sisterId}`,
      TIMELINE: (sisterId) => `/missions/journey/${sisterId}/timeline`,
      CREATE: (sisterId) => `/missions/journey/${sisterId}`,
      DETAIL: (sisterId, id) => `/missions/journey/${sisterId}/${id}`,
      UPDATE: (sisterId, id) => `/missions/journey/${sisterId}/${id}`,
      DELETE: (sisterId, id) => `/missions/journey/${sisterId}/${id}`,
      FILTER_BY_STAGE: "/missions/journey/filter",
      CURRENT_STAGE: (sisterId) => `/missions/journey/${sisterId}/current`,
      STATISTICS: "/missions/journey/statistics",
    },

    // Assignment (Sứ vụ)
    ASSIGNMENT: {
      LIST: (sisterId) => `/missions/assignment/${sisterId}`,
      CREATE: (sisterId) => `/missions/assignment/${sisterId}`,
      DETAIL: (sisterId, id) => `/missions/assignment/${sisterId}/${id}`,
      UPDATE: (sisterId, id) => `/missions/assignment/${sisterId}/${id}`,
      DELETE: (sisterId, id) => `/missions/assignment/${sisterId}/${id}`,
      CURRENT: (sisterId) => `/missions/assignment/${sisterId}/current`,
      HISTORY: (sisterId) => `/missions/assignment/${sisterId}/history`,
    },
  },

  // ============================================
  // COMMUNITY (CỘNG ĐOÀN)
  // ============================================
  COMMUNITY: {
    LIST: "/communities",
    CREATE: "/communities",
    DETAIL: (id) => `/communities/${id}`,
    UPDATE: (id) => `/communities/${id}`,
    DELETE: (id) => `/communities/${id}`,
    MEMBERS: (id) => `/communities/${id}/members`,
    ADD_MEMBER: (id) => `/communities/${id}/members`,
    REMOVE_MEMBER: (id, memberId) => `/communities/${id}/members/${memberId}`,
    UPDATE_MEMBER_ROLE: (id, memberId) =>
      `/communities/${id}/members/${memberId}`,
    STATISTICS: "/communities/statistics",
  },

  // ============================================
  // EDUCATION (HỌC VẤN)
  // ============================================
  EDUCATION: {
    LIST: (sisterId) => `/education/${sisterId}`,
    CREATE: (sisterId) => `/education/${sisterId}`,
    DETAIL: (sisterId, id) => `/education/${sisterId}/${id}`,
    UPDATE: (sisterId, id) => `/education/${sisterId}/${id}`,
    DELETE: (sisterId, id) => `/education/${sisterId}/${id}`,
    CERTIFICATES: (sisterId) => `/education/${sisterId}/certificates`,
    STATISTICS: "/education/statistics",
  },

  // ============================================
  // HEALTH (SỨC KHỎE)
  // ============================================
  HEALTH: {
    LIST: (sisterId) => `/health/${sisterId}`,
    CREATE: (sisterId) => `/health/${sisterId}`,
    DETAIL: (sisterId, id) => `/health/${sisterId}/${id}`,
    UPDATE: (sisterId, id) => `/health/${sisterId}/${id}`,
    DELETE: (sisterId, id) => `/health/${sisterId}/${id}`,
    LATEST: (sisterId) => `/health/${sisterId}/latest`,
    HISTORY: (sisterId) => `/health/${sisterId}/history`,
  },

  // ============================================
  // EVALUATION (ĐÁNH GIÁ)
  // ============================================
  EVALUATION: {
    LIST: (sisterId) => `/evaluations/${sisterId}`,
    CREATE: (sisterId) => `/evaluations/${sisterId}`,
    DETAIL: (sisterId, id) => `/evaluations/${sisterId}/${id}`,
    UPDATE: (sisterId, id) => `/evaluations/${sisterId}/${id}`,
    DELETE: (sisterId, id) => `/evaluations/${sisterId}/${id}`,
    BY_PERIOD: (sisterId, year) => `/evaluations/${sisterId}/period/${year}`,
    STATISTICS: "/evaluations/statistics",
  },

  // ============================================
  // REPORT (BÁO CÁO)
  // ============================================
  REPORT: {
    OVERVIEW: "/reports/overview",
    BY_AGE: "/reports/by-age",
    BY_STAGE: "/reports/by-stage",
    BY_COMMUNITY: "/reports/by-community",
    BY_MISSION: "/reports/by-mission",
    BY_EDUCATION: "/reports/by-education",
    EXPORT_EXCEL: "/reports/export/excel",
    EXPORT_PDF: "/reports/export/pdf",
    CUSTOM: "/reports/custom",
  },

  // ============================================
  // USER
  // ============================================
  USER: {
    LIST: "/users",
    CREATE: "/users",
    DETAIL: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    CHANGE_AVATAR: "/users/avatar",
  },

  // ============================================
  // UPLOAD
  // ============================================
  UPLOAD: {
    IMAGE: "/upload/image",
    FILE: "/upload/file",
    MULTIPLE: "/upload/multiple",
  },

  // ============================================
  // SETTINGS
  // ============================================
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
  },
};
