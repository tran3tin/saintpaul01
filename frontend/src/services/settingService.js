// src/services/settingService.js

import api from "./api";

const settingService = {
  /**
   * Get general settings
   * @returns {Promise}
   */
  getGeneral: async () => {
    try {
      const response = await api.get("/settings/general");
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải cài đặt chung",
      };
    }
  },

  /**
   * Update general settings
   * @param {object} data
   * @returns {Promise}
   */
  updateGeneral: async (data) => {
    try {
      const response = await api.put("/settings/general", data);
      return {
        success: response.data?.success || true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi cập nhật cài đặt chung",
      };
    }
  },

  /**
   * Get system settings
   * @returns {Promise}
   */
  getSystem: async () => {
    try {
      const response = await api.get("/settings/system");
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải cài đặt hệ thống",
      };
    }
  },

  /**
   * Update system settings
   * @param {object} data
   * @returns {Promise}
   */
  updateSystem: async (data) => {
    try {
      const response = await api.put("/settings/system", data);
      return {
        success: response.data?.success || true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi cập nhật cài đặt hệ thống",
      };
    }
  },

  /**
   * Test email configuration
   * @returns {Promise}
   */
  testEmail: async () => {
    try {
      const response = await api.post("/settings/test-email");
      return {
        success: response.data?.success || true,
        message: response.data?.message,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi test email",
      };
    }
  },

  /**
   * Clear cache
   * @returns {Promise}
   */
  clearCache: async () => {
    try {
      const response = await api.post("/settings/clear-cache");
      return {
        success: response.data?.success || true,
        message: response.data?.message,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa cache",
      };
    }
  },

  /**
   * Get user preferences
   * @returns {Promise}
   */
  getPreferences: async () => {
    try {
      const response = await api.get("/settings/preferences");
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải tùy chọn",
      };
    }
  },

  /**
   * Update user preferences
   * @param {object} data
   * @returns {Promise}
   */
  updatePreferences: async (data) => {
    try {
      const response = await api.put("/settings/preferences", data);
      return {
        success: response.data?.success || true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật tùy chọn",
      };
    }
  },

  /**
   * Reset preferences to default
   * @returns {Promise}
   */
  resetPreferences: async () => {
    try {
      const response = await api.post("/settings/preferences/reset");
      return {
        success: response.data?.success || true,
        message: response.data?.message,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi khôi phục tùy chọn",
      };
    }
  },

  /**
   * Get backups list
   * @returns {Promise}
   */
  getBackups: async () => {
    try {
      const response = await api.get("/settings/backups");
      return {
        success: true,
        data: response.data?.data || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách backup",
      };
    }
  },

  /**
   * Create new backup
   * @returns {Promise}
   */
  createBackup: async () => {
    try {
      const response = await api.post("/settings/backups");
      return {
        success: response.data?.success || true,
        message: response.data?.message,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo backup",
      };
    }
  },

  /**
   * Restore backup
   * @param {string|number} backupId
   * @returns {Promise}
   */
  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`/settings/backups/${backupId}/restore`);
      return {
        success: response.data?.success || true,
        message: response.data?.message,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi khôi phục backup",
      };
    }
  },

  /**
   * Download backup
   * @param {string|number} backupId
   * @returns {Promise}
   */
  downloadBackup: async (backupId) => {
    try {
      const response = await api.get(`/settings/backups/${backupId}/download`, {
        responseType: "blob",
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải backup",
      };
    }
  },

  /**
   * Delete backup
   * @param {string|number} backupId
   * @returns {Promise}
   */
  deleteBackup: async (backupId) => {
    try {
      await api.delete(`/settings/backups/${backupId}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa backup",
      };
    }
  },

  /**
   * Get storage info
   * @returns {Promise}
   */
  getStorageInfo: async () => {
    try {
      const response = await api.get("/settings/storage-info");
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải thông tin lưu trữ",
      };
    }
  },

  /**
   * Get all settings
   * @returns {Promise}
   */
  getAll: async () => {
    try {
      const response = await api.get("/settings");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải cài đặt",
      };
    }
  },

  /**
   * Update setting by key
   * @param {string} key
   * @param {any} value
   * @returns {Promise}
   */
  updateByKey: async (key, value) => {
    try {
      const response = await api.put(`/settings/${key}`, { value });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật cài đặt",
      };
    }
  },
};

export default settingService;
