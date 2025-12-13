// src/services/userService.js

import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

const userService = {
  /**
   * Get list of users
   * @param {object} params
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.USER.LIST || "/users", {
        params,
      });
      // Backend already returns {success: true, data: {items: [], total: 0}}
      return response;
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải danh sách người dùng",
      };
    }
  },

  /**
   * Get user by ID
   * @param {string|number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.USER.DETAIL
        ? API_ENDPOINTS.USER.DETAIL(id)
        : `/users/${id}`;
      const response = await api.get(endpoint);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải người dùng",
      };
    }
  },

  /**
   * Create new user
   * @param {object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.USER.CREATE || "/users",
        data
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tạo người dùng",
      };
    }
  },

  /**
   * Update user
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_ENDPOINTS.USER.UPDATE
        ? API_ENDPOINTS.USER.UPDATE(id)
        : `/users/${id}`;
      const response = await api.put(endpoint, data);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật người dùng",
      };
    }
  },

  /**
   * Delete user
   * @param {string|number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.USER.DELETE
        ? API_ENDPOINTS.USER.DELETE(id)
        : `/users/${id}`;
      const response = await api.delete(endpoint);
      return {
        success: response.success !== false,
        data: response,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa người dùng",
      };
    }
  },

  /**
   * Reset user password
   * @param {string|number} id
   * @returns {Promise}
   */
  resetPassword: async (id) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi đặt lại mật khẩu",
      };
    }
  },

  /**
   * Update user status
   * @param {string|number} id
   * @param {string} status
   * @returns {Promise}
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.post(`/users/${id}/toggle-status`, { status });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      };
    }
  },

  /**
   * Get user activities
   * @param {string|number} id
   * @returns {Promise}
   */
  getActivities: async (id) => {
    try {
      const response = await api.get(`/users/${id}/activities`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải hoạt động",
      };
    }
  },

  /**
   * Reset user password (admin only)
   * @param {string|number} id
   * @param {string} newPassword
   * @returns {Promise}
   */
  resetPassword: async (id, newPassword) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`, {
        newPassword,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi đặt lại mật khẩu",
      };
    }
  },

  /**
   * Get communities for a user
   * @param {string|number} userId
   * @returns {Promise}
   */
  getUserCommunities: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/communities`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi tải cộng đoàn người dùng",
      };
    }
  },

  /**
   * Update communities for a user
   * @param {string|number} userId
   * @param {Array<number>} communityIds
   * @returns {Promise}
   */
  updateUserCommunities: async (userId, communityIds) => {
    try {
      const response = await api.post(`/users/${userId}/communities`, {
        community_ids: communityIds,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Lỗi khi cập nhật cộng đoàn người dùng",
      };
    }
  },

  /**
   * Update profile
   * @param {object} data
   * @returns {Promise}
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.USER.UPDATE_PROFILE || "/profile",
        data
      );

      // Update user in localStorage
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật hồ sơ",
      };
    }
  },

  /**
   * Change password
   * @param {object} data
   * @returns {Promise}
   */
  changePassword: async (data) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.USER.CHANGE_PASSWORD || "/profile/change-password",
        data
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi đổi mật khẩu",
      };
    }
  },

  /**
   * Change avatar
   * @param {File} file
   * @returns {Promise}
   */
  changeAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post(
        API_ENDPOINTS.USER.CHANGE_AVATAR || "/profile/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update user in localStorage
      if (response.data) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.avatar = response.data.avatar;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện",
      };
    }
  },

  /**
   * Get all available permissions (grouped by module)
   * @returns {Promise}
   */
  getAllPermissions: async () => {
    try {
      const response = await api.get("/users/permissions/all");
      return {
        success: true,
        data: response.data, // Already grouped by module
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách quyền",
      };
    }
  },

  /**
   * Get permissions for a user
   * @param {string|number} userId
   * @returns {Promise}
   */
  getUserPermissions: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/permissions`);
      return {
        success: true,
        data: response.data, // Array of permission IDs
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải quyền người dùng",
      };
    }
  },

  /**
   * Update permissions for a user
   * @param {string|number} userId
   * @param {Array<number>} permissionIds
   * @returns {Promise}
   */
  updateUserPermissions: async (userId, permissionIds) => {
    try {
      const response = await api.put(`/users/${userId}/permissions`, {
        permissionIds,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Lỗi khi cập nhật quyền người dùng",
      };
    }
  },
};

export default userService;
