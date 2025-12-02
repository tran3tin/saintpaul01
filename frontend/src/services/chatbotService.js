import api from "./api";

const chatbotService = {
  sendMessage: async (data) => {
    try {
      // Debug: Check token before sending
      const token = localStorage.getItem("token");
      console.log("📤 Sending chatbot message, token exists:", !!token);
      
      const response = await api.post("/chatbot/chat", data);
      console.log("📥 Chatbot response:", response);
      return {
        success: true,
        response: response.response,
        conversation_id: response.conversation_id,
        sources: response.sources || [],
      };
    } catch (error) {
      console.error("❌ Chatbot error:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Lỗi khi gửi tin nhắn",
      };
    }
  },

  getHistory: async (conversationId) => {
    try {
      const response = await api.get(`/chatbot/history/${conversationId}`);
      return {
        success: true,
        data: response.data, // api.js already returns response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi tải lịch sử",
      };
    }
  },

  clearConversation: async (conversationId) => {
    try {
      await api.delete(`/chatbot/conversation/${conversationId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi xóa lịch sử",
      };
    }
  },

  submitFeedback: async (data) => {
    try {
      await api.post("/chatbot/feedback", data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Lỗi khi gửi phản hồi",
      };
    }
  },
};

export default chatbotService;
