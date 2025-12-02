// services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.client = null;
    this.model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  /**
   * Initialize Gemini client
   */
  initialize() {
    if (!this.client && process.env.GEMINI_API_KEY) {
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return this.client;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  }

  /**
   * Get system prompt
   */
  getSystemPrompt() {
    return `Bạn là trợ lý AI thông minh của hệ thống quản lý Hội Dòng Thánh Phaolô Thiện Bản.

Nhiệm vụ của bạn:
1. Trả lời các câu hỏi về nữ tu, hành trình ơn gọi, cộng đoàn dựa trên dữ liệu được cung cấp
2. Giải thích thông tin một cách rõ ràng, dễ hiểu
3. Sử dụng ngôn ngữ tôn trọng, lịch sự
4. Nếu không có đủ thông tin, hãy thành thật nói rằng bạn không biết
5. Trả lời bằng tiếng Việt

Các giai đoạn ơn gọi trong hệ thống:
- Tìm hiểu (Inquiry): Giai đoạn đầu tiên khi tìm hiểu về đời tu
- Tiền tập viện (Pre-postulancy): Chuẩn bị trước khi vào tập viện
- Tập viện (Postulancy): Giai đoạn tập viện
- Nhà tập (Novitiate): Giai đoạn nhà tập, học hỏi sâu hơn về đời tu
- Khấn tạm (Temporary Vows): Đã khấn lần đầu, cam kết tạm thời
- Khấn trọn (Perpetual Vows): Khấn vĩnh viễn, cam kết trọn đời

Lưu ý:
- Luôn dựa trên dữ liệu thực tế được cung cấp
- Không bịa đặt thông tin
- Trình bày có cấu trúc, dễ đọc
- Sử dụng emoji phù hợp để làm cho câu trả lời sinh động hơn`;
  }

  /**
   * Chat with Gemini
   */
  async chat(userMessage, context = null, conversationHistory = []) {
    try {
      // Initialize client if not already
      if (!this.initialize()) {
        // Fallback to context-based response
        return this.fallbackResponse(userMessage, context);
      }

      const model = this.client.getGenerativeModel({ model: this.model });

      // Build prompt with context
      let fullPrompt = this.getSystemPrompt() + "\n\n";

      // Add conversation history
      if (conversationHistory.length > 0) {
        fullPrompt += "Lịch sử hội thoại:\n";
        conversationHistory.slice(-6).forEach((msg) => {
          const role = msg.role === "user" ? "Người dùng" : "Trợ lý";
          fullPrompt += `${role}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }

      // Add context from database
      if (context && context.text) {
        fullPrompt += `📊 Dữ liệu liên quan từ hệ thống:\n${context.text}\n\n`;
      }

      // Add user message
      fullPrompt += `Người dùng hỏi: ${userMessage}\n\nHãy trả lời:`;

      // Call Gemini API
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Estimate tokens (Gemini doesn't return exact count in simple API)
      const estimatedTokens = Math.ceil((fullPrompt.length + text.length) / 4);

      return {
        success: true,
        message: text,
        tokens: estimatedTokens,
        promptTokens: Math.ceil(fullPrompt.length / 4),
        completionTokens: Math.ceil(text.length / 4),
        cost: 0, // Gemini Flash is very cheap
        model: this.model,
        context: context,
      };
    } catch (error) {
      console.error("Gemini API Error:", error.message);
      
      // Always fallback to context-based response on any error
      return this.fallbackResponse(userMessage, context);
    }
  }

  /**
   * Fallback response using context data
   */
  fallbackResponse(userMessage, context) {
    if (context && context.text) {
      return {
        success: true,
        message: `📋 **Thông tin từ hệ thống:**\n\n${context.text}`,
        tokens: 0,
        cost: 0,
        model: "database-fallback",
      };
    }
    
    return {
      success: true,
      message: `Xin chào! Tôi là trợ lý của hệ thống quản lý Hội Dòng Thánh Phaolô Thiện Bản.\n\n` +
        `Bạn có thể hỏi tôi về:\n` +
        `• 📋 Thông tin nữ tu\n` +
        `• 🛤️ Hành trình ơn gọi\n` +
        `• 🏠 Cộng đoàn\n` +
        `• 📊 Thống kê\n\n` +
        `Hãy thử hỏi: "Có bao nhiêu nữ tu?" hoặc "Danh sách cộng đoàn"`,
      tokens: 0,
      cost: 0,
      model: "welcome-fallback",
    };
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      provider: "Google Gemini",
      isConfigured: this.isConfigured(),
    };
  }
}

module.exports = new GeminiService();
