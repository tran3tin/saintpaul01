// src/features/audit-log/services/auditLogService.js

import api from "@services/api";

const auditLogService = {
  // Get all audit logs with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/audit-logs", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải nhật ký hệ thống",
      };
    }
  },

  // Get audit log by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/audit-logs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải chi tiết nhật ký",
      };
    }
  },

  // Get audit logs by user
  getByUser: async (userId, params = {}) => {
    try {
      const response = await api.get(`/audit-logs/user/${userId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải nhật ký người dùng",
      };
    }
  },

  // Get audit logs by entity
  getByEntity: async (entityType, entityId, params = {}) => {
    try {
      const response = await api.get(`/audit-logs/entity/${entityType}/${entityId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải nhật ký đối tượng",
      };
    }
  },

  // Export audit logs
  export: async (params = {}) => {
    try {
      const response = await api.get("/audit-logs/export", {
        params,
        responseType: "blob",
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xuất nhật ký",
      };
    }
  },

  // Get audit log statistics
  getStats: async (params = {}) => {
    try {
      const response = await api.get("/audit-logs/stats", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thống kê nhật ký",
      };
    }
  },
};

export default auditLogService;
