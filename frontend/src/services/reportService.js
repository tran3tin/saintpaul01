// src/services/reportService.js

import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

const reportService = {
  // ============================================
  // DASHBOARD & OVERVIEW
  // ============================================

  /**
   * Get dashboard data
   * @returns {Promise}
   */
  getDashboard: async () => {
    try {
      const response = await api.get("/reports/dashboard");
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải dashboard",
      };
    }
  },

  /**
   * Get overview report
   * @returns {Promise}
   */
  getOverview: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.OVERVIEW);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải tổng quan",
      };
    }
  },

  /**
   * Get general statistics
   * @param {object} filters
   * @returns {Promise}
   */
  getStatistics: async (filters = {}) => {
    try {
      const response = await api.get("/reports/statistics", {
        params: filters,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thống kê",
      };
    }
  },

  // ============================================
  // REPORTS BY CATEGORY
  // ============================================

  /**
   * Get report by age
   * @param {Object} params
   * @returns {Promise}
   */
  getByAge: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.BY_AGE, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo theo độ tuổi",
      };
    }
  },

  /**
   * Get report by stage
   * @param {Object} params
   * @returns {Promise}
   */
  getByStage: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.BY_STAGE, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo theo giai đoạn",
      };
    }
  },

  /**
   * Get report by community
   * @param {Object} params
   * @returns {Promise}
   */
  getByCommunity: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.BY_COMMUNITY, {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo theo cộng đoàn",
      };
    }
  },

  /**
   * Get report by mission
   * @param {Object} params
   * @returns {Promise}
   */
  getByMission: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.BY_MISSION, {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo theo sứ vụ",
      };
    }
  },

  /**
   * Get report by education
   * @param {Object} params
   * @returns {Promise}
   */
  getByEducation: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.REPORT.BY_EDUCATION, {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo theo học vấn",
      };
    }
  },

  // ============================================
  // SPECIFIC REPORTS
  // ============================================

  /**
   * Get sister report
   * @param {object} filters
   * @returns {Promise}
   */
  getSisterReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/sisters", { params: filters });
      // response is already response.data due to interceptor
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải báo cáo nữ tu",
      };
    }
  },

  /**
   * Get journey report
   * @param {object} filters
   * @returns {Promise}
   */
  getJourneyReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/journey", { params: filters });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải báo cáo hành trình",
      };
    }
  },

  /**
   * Get health report
   * @param {object} filters
   * @returns {Promise}
   */
  getHealthReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/health", { params: filters });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải báo cáo sức khỏe",
      };
    }
  },

  /**
   * Get evaluation report
   * @param {object} filters
   * @returns {Promise}
   */
  getEvaluationReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/evaluations", {
        params: filters,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải báo cáo đánh giá",
      };
    }
  },

  /**
   * Get custom report
   * @param {Object} params
   * @returns {Promise}
   */
  getCustomReport: async (params) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.REPORT.CUSTOM || "/reports/custom",
        params
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo báo cáo tùy chỉnh",
      };
    }
  },

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  /**
   * Helper function to download file
   * @param {Blob} blob
   * @param {string} filename
   */
  _downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export report to Excel
   * @param {string} reportType
   * @param {Object} params
   * @returns {Promise}
   */
  exportExcel: async (reportType, params = {}) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.REPORT.EXPORT_EXCEL || "/reports/export/excel",
        {
          params: { type: reportType, ...params },
          responseType: "blob",
        }
      );

      const filename = `report-${reportType}-${Date.now()}.xlsx`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo Excel",
      };
    }
  },

  /**
   * Export report to PDF
   * @param {string} reportType
   * @param {Object} params
   * @returns {Promise}
   */
  exportPDF: async (reportType, params = {}) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.REPORT.EXPORT_PDF || "/reports/export/pdf",
        {
          params: { type: reportType, ...params },
          responseType: "blob",
        }
      );

      const filename = `report-${reportType}-${Date.now()}.pdf`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo PDF",
      };
    }
  },

  /**
   * Export report (generic)
   * @param {string} format - 'excel' or 'pdf'
   * @param {object} filters
   * @returns {Promise}
   */
  export: async (format, filters = {}) => {
    try {
      const response = await api.get(`/reports/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const ext = format === "excel" ? "xlsx" : format;
      const filename = `report-${Date.now()}.${ext}`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo",
      };
    }
  },

  /**
   * Export sister report
   * @param {string} format
   * @param {object} filters
   * @returns {Promise}
   */
  exportSisterReport: async (format, filters = {}) => {
    try {
      const response = await api.get(`/reports/sisters/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const ext = format === "excel" ? "xlsx" : format;
      const filename = `sister-report-${Date.now()}.${ext}`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo nữ tu",
      };
    }
  },

  /**
   * Export journey report
   * @param {string} format
   * @param {object} filters
   * @returns {Promise}
   */
  exportJourneyReport: async (format, filters = {}) => {
    try {
      const response = await api.get(`/reports/journey/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const ext = format === "excel" ? "xlsx" : format;
      const filename = `journey-report-${Date.now()}.${ext}`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi xuất báo cáo hành trình",
      };
    }
  },

  /**
   * Export health report
   * @param {string} format
   * @param {object} filters
   * @returns {Promise}
   */
  exportHealthReport: async (format, filters = {}) => {
    try {
      const response = await api.get(`/reports/health/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const ext = format === "excel" ? "xlsx" : format;
      const filename = `health-report-${Date.now()}.${ext}`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo sức khỏe",
      };
    }
  },

  /**
   * Export evaluation report
   * @param {string} format
   * @param {object} filters
   * @returns {Promise}
   */
  exportEvaluationReport: async (format, filters = {}) => {
    try {
      const response = await api.get(`/reports/evaluations/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const ext = format === "excel" ? "xlsx" : format;
      const filename = `evaluation-report-${Date.now()}.${ext}`;
      reportService._downloadFile(response.data || response, filename);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất báo cáo đánh giá",
      };
    }
  },
};

export default reportService;
