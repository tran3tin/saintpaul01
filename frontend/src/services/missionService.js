// src/services/missionService.js

import api from "./api";

const MISSION_ENDPOINTS = {
  // Missions (Sứ vụ chung)
  LIST: "/missions",
  CREATE: "/missions",
  DETAIL: (id) => `/missions/${id}`,
  UPDATE: (id) => `/missions/${id}`,
  DELETE: (id) => `/missions/${id}`,
  BY_SISTER: (sisterId) => `/sisters/${sisterId}/missions`,
  STATISTICS: "/missions/statistics",

  // Journey (Hành trình ơn gọi)
  JOURNEY: {
    LIST: (sisterId) => `/sisters/${sisterId}/journey`,
    TIMELINE: (sisterId) => `/sisters/${sisterId}/journey/timeline`,
    DETAIL: (sisterId, id) => `/sisters/${sisterId}/journey/${id}`,
    CREATE: (sisterId) => `/sisters/${sisterId}/journey`,
    UPDATE: (sisterId, id) => `/sisters/${sisterId}/journey/${id}`,
    DELETE: (sisterId, id) => `/sisters/${sisterId}/journey/${id}`,
    CURRENT_STAGE: (sisterId) => `/sisters/${sisterId}/journey/current-stage`,
    FILTER_BY_STAGE: "/journey/filter-by-stage",
    STATISTICS: "/journey/statistics",
  },

  // Assignment (Bổ nhiệm sứ vụ)
  ASSIGNMENT: {
    LIST: (sisterId) => `/sisters/${sisterId}/assignments`,
    DETAIL: (sisterId, id) => `/sisters/${sisterId}/assignments/${id}`,
    CREATE: (sisterId) => `/sisters/${sisterId}/assignments`,
    UPDATE: (sisterId, id) => `/sisters/${sisterId}/assignments/${id}`,
    DELETE: (sisterId, id) => `/sisters/${sisterId}/assignments/${id}`,
    CURRENT: (sisterId) => `/sisters/${sisterId}/assignments/current`,
    HISTORY: (sisterId) => `/sisters/${sisterId}/assignments/history`,
  },
};

const missionService = {
  // ============================================
  // MISSIONS (SỨ VỤ CHUNG)
  // ============================================

  /**
   * Lấy danh sách sứ vụ với phân trang và bộ lọc
   * @param {object} params
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(MISSION_ENDPOINTS.LIST, { params });
      return {
        success: true,
        data: response.data || { items: [], total: 0 },
      };
    } catch (error) {
      console.error("Error fetching missions:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách sứ vụ",
        data: { items: [], total: 0 },
      };
    }
  },

  /**
   * Lấy chi tiết sứ vụ theo ID
   * @param {string|number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await api.get(MISSION_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching mission detail:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải chi tiết sứ vụ",
      };
    }
  },

  /**
   * Lấy danh sách sứ vụ theo nữ tu
   * @param {string|number} sisterId
   * @param {object} params
   * @returns {Promise}
   */
  getBySister: async (sisterId, params = {}) => {
    try {
      const response = await api.get(MISSION_ENDPOINTS.BY_SISTER(sisterId), { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching sister missions:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải sứ vụ của nữ tu",
        data: [],
      };
    }
  },

  /**
   * Tạo sứ vụ mới
   * @param {object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(MISSION_ENDPOINTS.CREATE, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating mission:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo sứ vụ mới",
      };
    }
  },

  /**
   * Cập nhật sứ vụ
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(MISSION_ENDPOINTS.UPDATE(id), data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating mission:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật sứ vụ",
      };
    }
  },

  /**
   * Xóa sứ vụ
   * @param {string|number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      await api.delete(MISSION_ENDPOINTS.DELETE(id));
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting mission:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa sứ vụ",
      };
    }
  },

  /**
   * Lấy thống kê sứ vụ
   * @param {object} params
   * @returns {Promise}
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get(MISSION_ENDPOINTS.STATISTICS, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching mission statistics:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thống kê sứ vụ",
      };
    }
  },

  // ============================================
  // JOURNEY (HÀNH TRÌNH ƠN GỌI)
  // ============================================
  journey: {
    /**
     * Lấy danh sách hành trình ơn gọi của nữ tu
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getList: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.LIST(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching journey list:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải hành trình ơn gọi",
          data: [],
        };
      }
    },

    /**
     * Lấy timeline hành trình
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getTimeline: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.TIMELINE(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching journey timeline:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải timeline hành trình",
          data: [],
        };
      }
    },

    /**
     * Lấy chi tiết hành trình
     * @param {string|number} sisterId
     * @param {string|number} id
     * @returns {Promise}
     */
    getDetail: async (sisterId, id) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.DETAIL(sisterId, id));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching journey detail:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải chi tiết hành trình",
        };
      }
    },

    /**
     * Tạo hành trình mới
     * @param {string|number} sisterId
     * @param {object} data
     * @returns {Promise}
     */
    create: async (sisterId, data) => {
      try {
        const response = await api.post(MISSION_ENDPOINTS.JOURNEY.CREATE(sisterId), data);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error creating journey:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tạo hành trình mới",
        };
      }
    },

    /**
     * Cập nhật hành trình
     * @param {string|number} sisterId
     * @param {string|number} id
     * @param {object} data
     * @returns {Promise}
     */
    update: async (sisterId, id, data) => {
      try {
        const response = await api.put(MISSION_ENDPOINTS.JOURNEY.UPDATE(sisterId, id), data);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error updating journey:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi cập nhật hành trình",
        };
      }
    },

    /**
     * Xóa hành trình
     * @param {string|number} sisterId
     * @param {string|number} id
     * @returns {Promise}
     */
    delete: async (sisterId, id) => {
      try {
        await api.delete(MISSION_ENDPOINTS.JOURNEY.DELETE(sisterId, id));
        return {
          success: true,
        };
      } catch (error) {
        console.error("Error deleting journey:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi xóa hành trình",
        };
      }
    },

    /**
     * Lọc theo giai đoạn
     * @param {string} stage
     * @returns {Promise}
     */
    filterByStage: async (stage) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.FILTER_BY_STAGE, {
          params: { stage },
        });
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error filtering journey by stage:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi lọc theo giai đoạn",
          data: [],
        };
      }
    },

    /**
     * Lấy giai đoạn hiện tại
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getCurrentStage: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.CURRENT_STAGE(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching current stage:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải giai đoạn hiện tại",
        };
      }
    },

    /**
     * Lấy thống kê hành trình
     * @returns {Promise}
     */
    getStatistics: async () => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.JOURNEY.STATISTICS);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching journey statistics:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải thống kê hành trình",
        };
      }
    },
  },

  // ============================================
  // ASSIGNMENT (BỔ NHIỆM SỨ VỤ)
  // ============================================
  assignment: {
    /**
     * Lấy danh sách bổ nhiệm của nữ tu
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getList: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.ASSIGNMENT.LIST(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching assignment list:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải danh sách bổ nhiệm",
          data: [],
        };
      }
    },

    /**
     * Lấy chi tiết bổ nhiệm
     * @param {string|number} sisterId
     * @param {string|number} id
     * @returns {Promise}
     */
    getDetail: async (sisterId, id) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.ASSIGNMENT.DETAIL(sisterId, id));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching assignment detail:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải chi tiết bổ nhiệm",
        };
      }
    },

    /**
     * Tạo bổ nhiệm mới
     * @param {string|number} sisterId
     * @param {object} data
     * @returns {Promise}
     */
    create: async (sisterId, data) => {
      try {
        const response = await api.post(MISSION_ENDPOINTS.ASSIGNMENT.CREATE(sisterId), data);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error creating assignment:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tạo bổ nhiệm mới",
        };
      }
    },

    /**
     * Cập nhật bổ nhiệm
     * @param {string|number} sisterId
     * @param {string|number} id
     * @param {object} data
     * @returns {Promise}
     */
    update: async (sisterId, id, data) => {
      try {
        const response = await api.put(MISSION_ENDPOINTS.ASSIGNMENT.UPDATE(sisterId, id), data);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error updating assignment:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi cập nhật bổ nhiệm",
        };
      }
    },

    /**
     * Xóa bổ nhiệm
     * @param {string|number} sisterId
     * @param {string|number} id
     * @returns {Promise}
     */
    delete: async (sisterId, id) => {
      try {
        await api.delete(MISSION_ENDPOINTS.ASSIGNMENT.DELETE(sisterId, id));
        return {
          success: true,
        };
      } catch (error) {
        console.error("Error deleting assignment:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi xóa bổ nhiệm",
        };
      }
    },

    /**
     * Lấy bổ nhiệm hiện tại
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getCurrent: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.ASSIGNMENT.CURRENT(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching current assignment:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải bổ nhiệm hiện tại",
        };
      }
    },

    /**
     * Lấy lịch sử bổ nhiệm
     * @param {string|number} sisterId
     * @returns {Promise}
     */
    getHistory: async (sisterId) => {
      try {
        const response = await api.get(MISSION_ENDPOINTS.ASSIGNMENT.HISTORY(sisterId));
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Error fetching assignment history:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Lỗi khi tải lịch sử bổ nhiệm",
          data: [],
        };
      }
    },
  },
};

export default missionService;
