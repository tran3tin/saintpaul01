// src/services/sisterService.js

import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

const sisterService = {
  /**
   * Get list of sisters with pagination and filters
   * @param {Object} params - { page, limit, search, filter }
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.SISTER.LIST, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get sister detail by ID
   * @param {string} id
   * @returns {Promise}
   */
  getDetail: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.SISTER.DETAIL(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new sister
   * @param {Object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.SISTER.CREATE, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update sister
   * @param {string} id
   * @param {Object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(API_ENDPOINTS.SISTER.UPDATE(id), data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete sister
   * @param {string} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.SISTER.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search sisters
   * @param {string} keyword
   * @returns {Promise}
   */
  search: async (keyword) => {
    try {
      const response = await api.get(API_ENDPOINTS.SISTER.SEARCH, {
        params: { q: keyword },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export sisters list to Excel
   * @param {Object} filters
   * @returns {Promise}
   */
  exportExcel: async (filters = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.SISTER.EXPORT, {
        params: filters,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sisters-list-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Import sisters from Excel
   * @param {File} file
   * @returns {Promise}
   */
  importExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(API_ENDPOINTS.SISTER.IMPORT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get statistics
   * @returns {Promise}
   */
  getStatistics: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SISTER.STATISTICS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload avatar for sister
   * @param {string} id - Sister ID
   * @param {File} file - Image file
   * @returns {Promise}
   */
  uploadAvatar: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post(
        API_ENDPOINTS.SISTER.UPLOAD_AVATAR(id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default sisterService;
