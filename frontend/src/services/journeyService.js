// src/services/journeyService.js

import api from "./api";

const JOURNEY_ENDPOINTS = {
  LIST: "/vocation-journeys",
  CREATE: "/vocation-journeys",
  DETAIL: (id) => `/vocation-journeys/${id}`,
  UPDATE: (id) => `/vocation-journeys/${id}`,
  DELETE: (id) => `/vocation-journeys/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/vocation-journeys`,
  TIMELINE: (sisterId) => `/sisters/${sisterId}/vocation-journeys/timeline`,
  STATISTICS: "/vocation-journeys/statistics",
  FILTER_BY_STAGE: "/vocation-journeys/filter",
};

const journeyService = {
  // Get list of all journeys with pagination and filters
  getList: async (params = {}) => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching journeys:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai danh sach hanh trinh",
        data: { items: [], total: 0 },
      };
    }
  },

  // Get journey by ID
  getById: async (id) => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching journey detail:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai chi tiet hanh trinh",
      };
    }
  },

  // Get journeys by sister ID
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.BY_SISTER(sisterId), { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister journeys:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai hanh trinh cua nu tu",
        data: [],
      };
    }
  },

  // Get timeline for a sister
  getTimeline: async (sisterId) => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.TIMELINE(sisterId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching timeline:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai timeline",
        data: [],
      };
    }
  },

  // Create new journey
  create: async (data) => {
    try {
      const response = await api.post(JOURNEY_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating journey:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tao hanh trinh moi",
      };
    }
  },

  // Update journey
  update: async (id, data) => {
    try {
      const response = await api.put(JOURNEY_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating journey:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the cap nhat hanh trinh",
      };
    }
  },

  // Delete journey
  delete: async (id) => {
    try {
      await api.delete(JOURNEY_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting journey:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the xoa hanh trinh",
      };
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.STATISTICS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching journey statistics:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the tai thong ke",
      };
    }
  },

  // Filter by stage
  filterByStage: async (stage, params = {}) => {
    try {
      const response = await api.get(JOURNEY_ENDPOINTS.FILTER_BY_STAGE, {
        params: { stage, ...params },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error filtering journeys:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Khong the loc hanh trinh",
        data: { items: [], total: 0 },
      };
    }
  },
};

export default journeyService;
