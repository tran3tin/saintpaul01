// src/services/evaluationService.js

import api from "./api";

const EVALUATION_ENDPOINTS = {
  LIST: "/evaluations",
  CREATE: "/evaluations",
  DETAIL: (id) => `/evaluations/${id}`,
  UPDATE: (id) => `/evaluations/${id}`,
  DELETE: (id) => `/evaluations/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/evaluations`,
  HISTORY: (sisterId) => `/sisters/${sisterId}/evaluations/history`,
  BY_PERIOD: (sisterId, year) => `/sisters/${sisterId}/evaluations/year/${year}`,
  STATISTICS: "/evaluations/statistics",
  COMPARE: "/evaluations/compare",
  EXPORT: (id) => `/evaluations/${id}/export`,
};

const evaluationService = {
  /**
   * Lấy danh sách đánh giá với phân trang và bộ lọc
   * @param {object} params - Tham số tìm kiếm, phân trang
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data || { items: [], total: 0 },
      };
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách đánh giá",
        data: { items: [], total: 0 },
      };
    }
  },

  /**
   * Lấy chi tiết đánh giá theo ID
   * @param {string|number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation detail:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải chi tiết đánh giá",
      };
    }
  },

  /**
   * Lấy danh sách đánh giá theo nữ tu
   * @param {string|number} sisterId
   * @param {object} params
   * @returns {Promise}
   */
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.BY_SISTER(sisterId), { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister evaluations:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải đánh giá của nữ tu",
        data: [],
      };
    }
  },

  /**
   * Lấy đánh giá theo năm
   * @param {string|number} sisterId
   * @param {number} year
   * @returns {Promise}
   */
  getByPeriod: async (sisterId, year) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.BY_PERIOD(sisterId, year));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation by period:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải đánh giá theo kỳ",
      };
    }
  },

  /**
   * Tạo đánh giá mới
   * @param {object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(EVALUATION_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating evaluation:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo đánh giá mới",
      };
    }
  },

  /**
   * Cập nhật đánh giá
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(EVALUATION_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating evaluation:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật đánh giá",
      };
    }
  },

  /**
   * Xóa đánh giá
   * @param {string|number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      await api.delete(EVALUATION_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa đánh giá",
      };
    }
  },

  /**
   * Lấy thống kê đánh giá
   * @param {object} params
   * @returns {Promise}
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.STATISTICS, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation statistics:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thống kê đánh giá",
      };
    }
  },

  /**
   * Lấy lịch sử đánh giá của nữ tu
   * @param {string|number} sisterId
   * @returns {Promise}
   */
  getHistory: async (sisterId) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.HISTORY(sisterId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation history:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải lịch sử đánh giá",
      };
    }
  },

  /**
   * So sánh các đánh giá
   * @param {array} evaluationIds - Mảng ID các đánh giá cần so sánh
   * @returns {Promise}
   */
  compare: async (evaluationIds) => {
    try {
      const response = await api.post(EVALUATION_ENDPOINTS.COMPARE, { ids: evaluationIds });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error comparing evaluations:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi so sánh đánh giá",
      };
    }
  },

  /**
   * Xuất đánh giá ra PDF
   * @param {string|number} id
   * @returns {Promise}
   */
  exportPDF: async (id) => {
    try {
      const response = await api.get(EVALUATION_ENDPOINTS.EXPORT(id), {
        responseType: "blob",
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error exporting evaluation to PDF:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất PDF",
      };
    }
  },
};

export default evaluationService;
