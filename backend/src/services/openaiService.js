// services/openaiService.js

const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    this.client = null;
    this.model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.pricing = {
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-4o": { input: 0.005, output: 0.015 },
      "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    };
  }

  /**
   * Initialize OpenAI client
   */
  initialize() {
    if (!this.client && process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
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
   * Chat with OpenAI
   */
  async chat(userMessage, context = null, conversationHistory = []) {
    try {
      // Initialize client if not already
      if (!this.initialize()) {
        return {
          success: false,
          message:
            "Dịch vụ AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
          error: "OpenAI API key not configured",
        };
      }

      // Build messages array
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(),
        },
      ];

      // Add conversation history (last 10 messages for context)
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10);
        recentHistory.forEach((msg) => {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          });
        });
      }

      // Add context from database
      if (context && context.text) {
        messages.push({
          role: "system",
          content: `📊 Dữ liệu liên quan từ hệ thống:\n\n${context.text}`,
        });
      }

      // Add user message
      messages.push({
        role: "user",
        content: userMessage,
      });

      // Call OpenAI API
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const response = completion.choices[0].message.content;
      const usage = completion.usage;

      // Calculate cost
      const cost = this.calculateCost(usage);

      return {
        success: true,
        message: response,
        tokens: usage.total_tokens,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        cost: cost,
        model: this.model,
        context: context,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error.message);

      // Handle quota exceeded - return context-based response
      if (error.status === 429 || error.code === "insufficient_quota") {
        // Fallback: return context data directly
        if (context && context.text) {
          return {
            success: true,
            message: `⚠️ *Chế độ offline - Dữ liệu từ hệ thống:*\n\n${context.text}\n\n_Lưu ý: AI đang tạm ngưng, đây là dữ liệu trực tiếp từ database._`,
            tokens: 0,
            cost: 0,
            model: "offline-fallback",
          };
        }
        return {
          success: false,
          message:
            "⚠️ Hệ thống AI đã hết quota. Vui lòng liên hệ quản trị viên để nạp thêm credit OpenAI.",
          error: error.message,
        };
      }

      if (error.code === "rate_limit_exceeded") {
        return {
          success: false,
          message:
            "Hệ thống đang bận, vui lòng thử lại sau vài giây.",
          error: error.message,
        };
      }

      return {
        success: false,
        message:
          "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.",
        error: error.message,
      };
    }
  }

  /**
   * Calculate cost based on token usage
   */
  calculateCost(usage) {
    const pricing = this.pricing[this.model];

    if (!pricing) {
      return 0;
    }

    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;

    return parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      pricing: this.pricing[this.model] || null,
      isConfigured: this.isConfigured(),
    };
  }
}

module.exports = new OpenAIService();
