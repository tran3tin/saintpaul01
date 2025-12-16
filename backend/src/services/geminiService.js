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
   * Get system prompt - Enhanced for better understanding and responses
   */
  getSystemPrompt() {
    return `Bạn là trợ lý AI thông minh của hệ thống quản lý Hội Dòng Thánh Phaolô Thiện Bản.

## VAI TRÒ VÀ NHIỆM VỤ
1. Trả lời các câu hỏi về nữ tu, hành trình ơn gọi, cộng đoàn một cách CHÍNH XÁC dựa trên dữ liệu được cung cấp
2. Giải thích thông tin rõ ràng, dễ hiểu, có cấu trúc
3. Sử dụng ngôn ngữ tôn trọng, lịch sự, phù hợp với môi trường tôn giáo
4. Nếu không có đủ thông tin, hãy thành thật nói rằng bạn không có dữ liệu và đề xuất cách khác
5. Trả lời bằng tiếng Việt tự nhiên

## CÁC GIAI ĐOẠN ƠN GỌI (theo thứ tự)
1. **Tìm hiểu (Inquiry)**: Giai đoạn đầu tiên khi tìm hiểu về đời tu
2. **Tiền tập viện (Pre-postulancy)**: Chuẩn bị trước khi vào tập viện  
3. **Tập viện (Postulancy)**: Giai đoạn tập viện, học hỏi căn bản
4. **Nhà tập (Novitiate)**: Giai đoạn nhà tập, học hỏi sâu hơn về đời tu
5. **Khấn tạm (Temporary Vows)**: Đã khấn lần đầu, cam kết tạm thời (thường 3-6 năm)
6. **Khấn trọn (Perpetual Vows)**: Khấn vĩnh viễn, cam kết trọn đời

## CÁCH TRẢ LỜI
- **Câu hỏi về số lượng**: Trả lời số liệu cụ thể trước, sau đó giải thích thêm nếu cần
- **Câu hỏi về thông tin cá nhân**: Trình bày có cấu trúc với các mục rõ ràng
- **Câu hỏi về danh sách**: Sử dụng bullet points hoặc đánh số
- **Câu hỏi so sánh**: Sử dụng bảng hoặc so sánh song song
- **Câu hỏi không rõ ràng**: Hỏi lại để làm rõ thay vì đoán

## QUY TẮC QUAN TRỌNG
1. KHÔNG bịa đặt thông tin - chỉ dựa trên dữ liệu được cung cấp
2. Nếu dữ liệu là "N/A" hoặc trống, nói rõ "Chưa có thông tin" thay vì bỏ qua
3. Sử dụng emoji phù hợp để làm câu trả lời sinh động (👤 📍 📊 🏠 📚 ✅ ❌)
4. Khi đề cập đến người, dùng "Chị" hoặc tên thánh đi kèm tên
5. Format ngày tháng theo kiểu Việt Nam (DD/MM/YYYY)
6. Với số liệu, làm tròn và thêm đơn vị rõ ràng

## XỬ LÝ CÂU HỎI PHỨC TẠP
- Nếu câu hỏi có nhiều phần, trả lời từng phần một cách rõ ràng
- Nếu câu hỏi mơ hồ, xác nhận lại ý người dùng
- Nếu không tìm thấy chính xác, gợi ý kết quả tương tự

## VÍ DỤ CÂU TRẢ LỜI TỐT
Q: "Có bao nhiêu nữ tu?"
A: "📊 Hiện tại có **[số]** nữ tu trong hệ thống."

Q: "Cho tôi thông tin về chị Maria"
A: "👤 **Thông tin về Chị Maria [Họ tên]**

📋 **Thông tin cơ bản:**
- Tên thánh: Maria
- Họ tên: [Họ tên đầy đủ]
- Mã số: [Code]
...

📍 **Cộng đoàn hiện tại:** [Tên cộng đoàn]"`;
  }

  /**
   * Chat with Gemini - Enhanced with better context handling
   */
  async chat(userMessage, context = null, conversationHistory = []) {
    try {
      // Initialize client if not already
      if (!this.initialize()) {
        // Fallback to context-based response
        return this.fallbackResponse(userMessage, context);
      }

      const model = this.client.getGenerativeModel({ model: this.model });

      // Build prompt with enhanced context
      let fullPrompt = this.getSystemPrompt() + "\n\n";

      // Add conversation history for context continuity
      if (conversationHistory.length > 0) {
        fullPrompt += "## LỊCH SỬ HỘI THOẠI GẦN ĐÂY\n";
        conversationHistory.slice(-6).forEach((msg) => {
          const role = msg.role === "user" ? "👤 Người dùng" : "🤖 Trợ lý";
          fullPrompt += `${role}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }

      // Add context from database with clear formatting
      if (context && context.text) {
        fullPrompt += `## DỮ LIỆU TỪ HỆ THỐNG\n`;
        fullPrompt += `Đây là dữ liệu thực tế từ cơ sở dữ liệu. Hãy dựa vào dữ liệu này để trả lời:\n\n`;
        fullPrompt += `${context.text}\n\n`;

        // Add metadata about context if available
        if (context.data) {
          if (context.data.totalSisters !== undefined) {
            fullPrompt += `📊 Tổng số nữ tu trong hệ thống: ${context.data.totalSisters}\n`;
          }
          if (context.data.totalCommunities !== undefined) {
            fullPrompt += `🏠 Tổng số cộng đoàn: ${context.data.totalCommunities}\n`;
          }
        }
        fullPrompt += "\n";
      }

      // Add user message with clear instruction
      fullPrompt += `## CÂU HỎI CỦA NGƯỜI DÙNG\n`;
      fullPrompt += `"${userMessage}"\n\n`;
      fullPrompt += `## YÊU CẦU\n`;
      fullPrompt += `Hãy trả lời câu hỏi trên một cách chính xác, dựa trên dữ liệu đã cung cấp. `;
      fullPrompt += `Nếu không có dữ liệu liên quan, hãy nói rõ và đề xuất cách khác.\n\n`;
      fullPrompt += `## CÂU TRẢ LỜI`;

      // Call Gemini API with safety settings
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

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
      message:
        `Xin chào! Tôi là trợ lý của hệ thống quản lý Hội Dòng Thánh Phaolô Thiện Bản.\n\n` +
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
