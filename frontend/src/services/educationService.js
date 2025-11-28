// src/services/educationService.js

import api from "./api";

const EDUCATION_ENDPOINTS = {
  LIST: "/education",
  CREATE: "/education",
  DETAIL: (id) => `/education/${id}`,
  UPDATE: (id) => `/education/${id}`,
  DELETE: (id) => `/education/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/education`,
  CERTIFICATES: (sisterId) => `/sisters/${sisterId}/education/certificates`,
  STATISTICS: "/education/statistics",
};

const educationService = {
  /**
   * Lấy danh sách học vấn với phân trang và bộ lọc
   * @param {object} params - Tham số tìm kiếm, phân trang
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(EDUCATION_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data || { items: [], total: 0 },
      };
    } catch (error) {
      console.error("Error fetching education records:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách học vấn",
        data: { items: [], total: 0 },
      };
    }
  },

  /**
   * Lấy chi tiết học vấn theo ID
   * @param {string|number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await api.get(EDUCATION_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching education detail:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải chi tiết học vấn",
      };
    }
  },

  /**
   * Lấy danh sách học vấn theo nữ tu
   * @param {string|number} sisterId
   * @param {object} params
   * @returns {Promise}
   */
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(EDUCATION_ENDPOINTS.BY_SISTER(sisterId), { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister education:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải học vấn của nữ tu",
        data: [],
      };
    }
  },

  /**
   * Tạo hồ sơ học vấn mới
   * @param {object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(EDUCATION_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating education record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo hồ sơ học vấn mới",
      };
    }
  },

  /**
   * Cập nhật hồ sơ học vấn
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(EDUCATION_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating education record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật học vấn",
      };
    }
  },

  /**
   * Xóa hồ sơ học vấn
   * @param {string|number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      await api.delete(EDUCATION_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting education record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa học vấn",
      };
    }
  },

  /**
   * Lấy danh sách chứng chỉ của nữ tu
   * @param {string|number} sisterId
   * @returns {Promise}
   */
  getCertificates: async (sisterId) => {
    try {
      const response = await api.get(EDUCATION_ENDPOINTS.CERTIFICATES(sisterId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách chứng chỉ",
        data: [],
      };
    }
  },

  /**
   * Lấy thống kê học vấn
   * @param {object} params
   * @returns {Promise}
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get(EDUCATION_ENDPOINTS.STATISTICS, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching education statistics:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thống kê học vấn",
      };
    }
  },
};

export default educationService;
