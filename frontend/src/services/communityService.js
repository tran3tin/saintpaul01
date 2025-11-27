// src/services/communityService.js

import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

const communityService = {
  /**
   * Get list of communities
   * @param {Object} params
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.COMMUNITY.LIST, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get community detail
   * @param {string} id
   * @returns {Promise}
   */
  getDetail: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.COMMUNITY.DETAIL(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create community
   * @param {Object} data
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.COMMUNITY.CREATE, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update community
   * @param {string} id
   * @param {Object} data
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(API_ENDPOINTS.COMMUNITY.UPDATE(id), data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete community
   * @param {string} id
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.COMMUNITY.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get community members
   * @param {string} id
   * @returns {Promise}
   */
  getMembers: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.COMMUNITY.MEMBERS(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add member to community
   * @param {string} id
   * @param {Object} data - { sisterId, role }
   * @returns {Promise}
   */
  addMember: async (id, data) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.COMMUNITY.ADD_MEMBER(id),
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove member from community
   * @param {string} id
   * @param {string} memberId
   * @returns {Promise}
   */
  removeMember: async (id, memberId) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.COMMUNITY.REMOVE_MEMBER(id, memberId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update member role in community
   * @param {string} id - Community ID
   * @param {string} memberId - Member ID
   * @param {Object} data - { role }
   * @returns {Promise}
   */
  updateMemberRole: async (id, memberId, data) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.COMMUNITY.UPDATE_MEMBER_ROLE(id, memberId),
        data
      );
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
      const response = await api.get(API_ENDPOINTS.COMMUNITY.STATISTICS);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default communityService;
