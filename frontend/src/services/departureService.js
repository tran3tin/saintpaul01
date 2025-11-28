// src/services/departureService.js

import api from "./api";

const DEPARTURE_ENDPOINTS = {
  LIST: "/departures",
  CREATE: "/departures",
  DETAIL: (id) => `/departures/${id}`,
  UPDATE: (id) => `/departures/${id}`,
  DELETE: (id) => `/departures/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/departures`,
  STATISTICS: "/departures/statistics",
};

const departureService = {
  // Get list of all departures with pagination and filters
  getList: async (params = {}) => {
    try {
      const response = await api.get(DEPARTURE_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching departures:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tải danh sách đi vắng",
        data: { items: [], total: 0 },
      };
    }
  },

  // Get departure by ID
  getById: async (id) => {
    try {
      const response = await api.get(DEPARTURE_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching departure detail:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tải chi tiết đi vắng",
      };
    }
  },

  // Get departures by sister ID
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(DEPARTURE_ENDPOINTS.BY_SISTER(sisterId), {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister departures:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Không thể tải danh sách đi vắng của nữ tu",
        data: [],
      };
    }
  },

  // Create new departure
  create: async (data) => {
    try {
      const response = await api.post(DEPARTURE_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating departure:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tạo phiếu đi vắng mới",
      };
    }
  },

  // Update departure
  update: async (id, data) => {
    try {
      const response = await api.put(DEPARTURE_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating departure:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể cập nhật phiếu đi vắng",
      };
    }
  },

  // Delete departure
  delete: async (id) => {
    try {
      await api.delete(DEPARTURE_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting departure:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Không thể xóa phiếu đi vắng",
      };
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get(DEPARTURE_ENDPOINTS.STATISTICS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching departure statistics:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tải thống kê đi vắng",
      };
    }
  },
};

export default departureService;
