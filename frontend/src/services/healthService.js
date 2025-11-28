// src/services/healthService.js

import api from "./api";

const HEALTH_ENDPOINTS = {
  LIST: "/health-records",
  CREATE: "/health-records",
  DETAIL: (id) => `/health-records/${id}`,
  UPDATE: (id) => `/health-records/${id}`,
  DELETE: (id) => `/health-records/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/health-records`,
  LATEST: (sisterId) => `/sisters/${sisterId}/health-records/latest`,
  HISTORY: (sisterId) => `/sisters/${sisterId}/health-records/history`,
  STATISTICS: "/health-records/statistics",
};

const healthService = {
  // Get list of all health records with pagination and filters
  getList: async (params = {}) => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data || { items: [], total: 0 },
      };
    } catch (error) {
      console.error("Error fetching health records:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai danh sach ho so suc khoe",
        data: { items: [], total: 0 },
      };
    }
  },

  // Get health record by ID
  getById: async (id) => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching health record detail:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai chi tiet ho so suc khoe",
      };
    }
  },

  // Get health records by sister ID
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.BY_SISTER(sisterId), { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister health records:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai ho so suc khoe cua nu tu",
        data: [],
      };
    }
  },

  // Create new health record
  create: async (data) => {
    try {
      const response = await api.post(HEALTH_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating health record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tao ho so suc khoe moi",
      };
    }
  },

  // Update health record
  update: async (id, data) => {
    try {
      const response = await api.put(HEALTH_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating health record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the cap nhat ho so suc khoe",
      };
    }
  },

  // Delete health record
  delete: async (id) => {
    try {
      await api.delete(HEALTH_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting health record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the xoa ho so suc khoe",
      };
    }
  },

  // Get latest health record for a sister
  getLatest: async (sisterId) => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.LATEST(sisterId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching latest health record:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai ho so suc khoe moi nhat",
      };
    }
  },

  // Get health history for a sister
  getHistory: async (sisterId) => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.HISTORY(sisterId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching health history:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai lich su suc khoe",
      };
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get(HEALTH_ENDPOINTS.STATISTICS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching health statistics:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai thong ke suc khoe",
      };
    }
  },
};

export default healthService;
