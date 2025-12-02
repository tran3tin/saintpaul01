// services/chatbotService.js

const db = require("../config/database");
const NodeCache = require("node-cache");

// Cache for 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

class ChatbotService {
  /**
   * Analyze message to detect intent and extract entities
   */
  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();

    const analysis = {
      intent: "general",
      entities: {},
      keywords: [],
    };

    // Detect intent based on keywords
    const intentPatterns = [
      {
        intent: "journey_info",
        patterns: [
          /hành trình/i,
          /ơn gọi/i,
          /giai đoạn/i,
          /khấn/i,
          /nhà tập/i,
          /tập viện/i,
          /tiền tập/i,
          /tìm hiểu/i,
        ],
      },
      {
        intent: "sister_info",
        patterns: [
          /nữ tu/i,
          /chị\s+\w+/i,
          /sơ\s+\w+/i,
          /thông tin\s+(về\s+)?/i,
          /hồ sơ/i,
          /cho .* biết về/i,
          /tìm .* về/i,
        ],
      },
      {
        intent: "community_info",
        patterns: [/cộng đoàn/i, /community/i, /nhà dòng/i, /địa chỉ/i],
      },
      {
        intent: "statistics",
        patterns: [
          /thống kê/i,
          /báo cáo/i,
          /tổng số/i,
          /bao nhiêu/i,
          /số lượng/i,
          /report/i,
        ],
      },
      {
        intent: "education_info",
        patterns: [/học vấn/i, /bằng cấp/i, /trình độ/i, /tốt nghiệp/i],
      },
      {
        intent: "health_info",
        patterns: [/sức khỏe/i, /bệnh/i, /khám/i, /điều trị/i],
      },
      {
        intent: "help",
        patterns: [/giúp đỡ/i, /hướng dẫn/i, /sử dụng/i, /làm sao/i, /cách/i],
      },
    ];

    for (const { intent, patterns } of intentPatterns) {
      if (patterns.some((pattern) => pattern.test(message))) {
        analysis.intent = intent;
        break;
      }
    }

    // Extract keywords
    const keywords = message.match(/\b\w{3,}\b/g) || [];
    analysis.keywords = keywords.filter(
      (word) =>
        !["này", "của", "các", "những", "được", "trong", "không"].includes(
          word.toLowerCase()
        )
    );

    return analysis;
  }

  /**
   * Extract entities from message
   */
  async extractEntities(message) {
    const entities = {};

    try {
      // Extract sister names from database (status = 'active' or no filter for flexibility)
      const [sisters] = await db.execute(
        "SELECT id, birth_name, saint_name, code FROM sisters"
      );

      const lowerMessage = message.toLowerCase();
      
      // Sort sisters by name length (longest first) to match more specific names first
      // e.g., "trần tín 1" should match before "trần tín"
      const sortedSisters = sisters.sort((a, b) => {
        const aLen = (a.birth_name || "").length;
        const bLen = (b.birth_name || "").length;
        return bLen - aLen;
      });

      for (const sister of sortedSisters) {
        const birthName = (sister.birth_name || "").toLowerCase().trim();
        const saintName = (sister.saint_name || "").toLowerCase().trim();
        const code = (sister.code || "").toLowerCase().trim();

        if (
          (birthName && lowerMessage.includes(birthName)) ||
          (saintName && lowerMessage.includes(saintName)) ||
          (code && lowerMessage.includes(code))
        ) {
          entities.sister_id = sister.id;
          entities.sister_name = sister.birth_name;
          entities.saint_name = sister.saint_name;
          break;
        }
      }

      // Extract community names
      const [communities] = await db.execute(
        "SELECT id, name, code FROM communities"
      );

      for (const community of communities) {
        const name = (community.name || "").toLowerCase();
        const code = (community.code || "").toLowerCase();
        const lowerMessage = message.toLowerCase();

        if (
          (name && lowerMessage.includes(name)) ||
          (code && lowerMessage.includes(code))
        ) {
          entities.community_id = community.id;
          entities.community_name = community.name;
          break;
        }
      }

      // Extract dates
      const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dateMatch) {
        entities.date = dateMatch[0];
      }

      // Extract year
      const yearMatch = message.match(/năm\s+(\d{4})/i);
      if (yearMatch) {
        entities.year = parseInt(yearMatch[1]);
      }

      // Extract stage keywords
      const stagePatterns = {
        inquiry: /tìm hiểu/i,
        pre_postulancy: /tiền tập/i,
        postulancy: /tập viện/i,
        novitiate: /nhà tập/i,
        temporary_vows: /khấn tạm/i,
        perpetual_vows: /khấn trọn|khấn vĩnh viễn/i,
      };

      for (const [stage, pattern] of Object.entries(stagePatterns)) {
        if (pattern.test(message)) {
          entities.stage = stage;
          break;
        }
      }
    } catch (error) {
      console.error("Error extracting entities:", error);
    }

    return entities;
  }

  /**
   * Retrieve context from database based on intent and entities
   */
  async retrieveContext(analysis, entities) {
    const cacheKey = `context_${analysis.intent}_${JSON.stringify(entities)}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let context = {
      text: "",
      data: {},
      sources: [],
    };

    try {
      switch (analysis.intent) {
        case "journey_info":
          context = await this.getJourneyContext(entities);
          break;
        case "sister_info":
          context = await this.getSisterContext(entities);
          break;
        case "community_info":
          context = await this.getCommunityContext(entities);
          break;
        case "statistics":
          context = await this.getStatisticsContext(entities);
          break;
        case "education_info":
          context = await this.getEducationContext(entities);
          break;
        case "help":
          context = this.getHelpContext();
          break;
        default:
          context = await this.getGeneralContext();
      }

      // Cache the result
      if (context.text) {
        cache.set(cacheKey, context);
      }
    } catch (error) {
      console.error("Error retrieving context:", error);
      context.text = "Không thể truy xuất dữ liệu từ hệ thống.";
    }

    return context;
  }

  /**
   * Get journey context
   */
  async getJourneyContext(entities) {
    let contextText = "";
    let data = {};
    const sources = [];

    if (entities.sister_id) {
      // Get specific sister journey
      const [sisters] = await db.execute(
        `SELECT s.*, c.name as community_name
         FROM sisters s
         LEFT JOIN communities c ON s.current_community_id = c.id
         WHERE s.id = ?`,
        [entities.sister_id]
      );

      if (sisters.length > 0) {
        const sister = sisters[0];

        // Get journey records
        const [journeys] = await db.execute(
          `SELECT vj.*, js.name as stage_name, js.color as stage_color
           FROM vocation_journey vj
           LEFT JOIN journey_stages js ON vj.stage = js.code
           WHERE vj.sister_id = ?
           ORDER BY vj.start_date ASC`,
          [entities.sister_id]
        );

        contextText = `📋 Hành trình ơn gọi của ${sister.saint_name || ""} ${sister.birth_name}:\n\n`;
        contextText += `👤 Thông tin cơ bản:\n`;
        contextText += `- Tên thánh: ${sister.saint_name || "N/A"}\n`;
        contextText += `- Họ tên: ${sister.birth_name}\n`;
        contextText += `- Mã số: ${sister.code}\n`;
        contextText += `- Cộng đoàn hiện tại: ${sister.community_name || "N/A"}\n\n`;

        if (journeys.length > 0) {
          contextText += `📍 Các giai đoạn đã trải qua:\n`;
          journeys.forEach((journey, index) => {
            const startDate = new Date(journey.start_date).toLocaleDateString("vi-VN");
            const endDate = journey.end_date
              ? new Date(journey.end_date).toLocaleDateString("vi-VN")
              : "Hiện tại";
            contextText += `${index + 1}. ${journey.stage_name || journey.stage}\n`;
            contextText += `   - Thời gian: ${startDate} → ${endDate}\n`;
            if (journey.location) {
              contextText += `   - Địa điểm: ${journey.location}\n`;
            }
            if (journey.notes) {
              contextText += `   - Ghi chú: ${journey.notes}\n`;
            }
          });
        } else {
          contextText += "Chưa có thông tin hành trình ơn gọi.\n";
        }

        data = { sister, journeys };
        sources.push({ type: "sister", id: sister.id, name: sister.birth_name });
      }
    } else {
      // General journey statistics
      const [stageStats] = await db.execute(
        `SELECT js.name as stage_name, js.code, COUNT(DISTINCT vj.sister_id) as count
         FROM journey_stages js
         LEFT JOIN vocation_journey vj ON js.code = vj.stage AND vj.end_date IS NULL
         WHERE js.is_active = 1
         GROUP BY js.id, js.name, js.code
         ORDER BY js.display_order`
      );

      contextText = `📊 Thống kê hành trình ơn gọi hiện tại:\n\n`;
      stageStats.forEach((stage) => {
        contextText += `- ${stage.stage_name}: ${stage.count || 0} nữ tu\n`;
      });

      data = { stageStats };
    }

    return { text: contextText, data, sources };
  }

  /**
   * Get sister context
   */
  async getSisterContext(entities) {
    let contextText = "";
    let data = {};
    const sources = [];

    if (entities.sister_id) {
      // Get specific sister info
      const [sisters] = await db.execute(
        `SELECT s.*, c.name as community_name
         FROM sisters s
         LEFT JOIN communities c ON s.current_community_id = c.id
         WHERE s.id = ?`,
        [entities.sister_id]
      );

      if (sisters.length > 0) {
        const sister = sisters[0];

        // Get education
        const [educations] = await db.execute(
          "SELECT * FROM education WHERE sister_id = ? ORDER BY start_date DESC",
          [sister.id]
        );

        contextText = `👤 Thông tin chi tiết về ${sister.saint_name || ""} ${sister.birth_name}:\n\n`;
        contextText += `📋 Thông tin cơ bản:\n`;
        contextText += `- Tên thánh: ${sister.saint_name || "N/A"}\n`;
        contextText += `- Họ tên: ${sister.birth_name}\n`;
        contextText += `- Mã số: ${sister.code}\n`;
        contextText += `- Ngày sinh: ${sister.date_of_birth ? new Date(sister.date_of_birth).toLocaleDateString("vi-VN") : "N/A"}\n`;
        contextText += `- Nơi sinh: ${sister.birth_place || "N/A"}\n`;
        contextText += `- Cộng đoàn: ${sister.community_name || "N/A"}\n`;
        contextText += `- Email: ${sister.email || "N/A"}\n`;
        contextText += `- Điện thoại: ${sister.phone || "N/A"}\n`;

        if (educations.length > 0) {
          contextText += `\n📚 Học vấn:\n`;
          educations.forEach((edu) => {
            contextText += `- ${edu.degree || edu.level}: ${edu.major || edu.field} tại ${edu.institution}\n`;
          });
        }

        data = { sister, educations };
        sources.push({ type: "sister", id: sister.id, name: sister.birth_name });
      }
    } else {
      // General sister statistics
      const [[totalResult]] = await db.execute(
        "SELECT COUNT(*) as total FROM sisters"
      );

      const [byCommunity] = await db.execute(
        `SELECT c.name, COUNT(s.id) as count
         FROM communities c
         LEFT JOIN sisters s ON c.id = s.current_community_id
         GROUP BY c.id, c.name
         ORDER BY count DESC`
      );

      contextText = `👥 Thông tin chung về các nữ tu:\n\n`;
      contextText += `Tổng số nữ tu đang hoạt động: ${totalResult.total}\n\n`;
      contextText += `Phân bổ theo cộng đoàn:\n`;
      byCommunity.forEach((item) => {
        contextText += `- ${item.name}: ${item.count} nữ tu\n`;
      });

      data = { total: totalResult.total, byCommunity };
    }

    return { text: contextText, data, sources };
  }

  /**
   * Get community context
   */
  async getCommunityContext(entities) {
    let contextText = "";
    let data = {};

    if (entities.community_id) {
      // Get specific community
      const [communities] = await db.execute(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM sisters s WHERE s.current_community_id = c.id) as member_count
         FROM communities c
         WHERE c.id = ?`,
        [entities.community_id]
      );

      if (communities.length > 0) {
        const community = communities[0];

        // Get members
        const [members] = await db.execute(
          `SELECT id, birth_name, saint_name, code
           FROM sisters
           WHERE current_community_id = ?
           ORDER BY birth_name`,
          [community.id]
        );

        contextText = `🏠 Thông tin cộng đoàn ${community.name}:\n\n`;
        contextText += `- Mã: ${community.code}\n`;
        contextText += `- Địa chỉ: ${community.address || "N/A"}\n`;
        contextText += `- Điện thoại: ${community.phone || "N/A"}\n`;
        contextText += `- Email: ${community.email || "N/A"}\n`;
        contextText += `- Số thành viên: ${community.member_count}\n`;

        if (members.length > 0) {
          contextText += `\n👥 Danh sách thành viên:\n`;
          members.forEach((member, index) => {
            contextText += `${index + 1}. ${member.saint_name || ""} ${member.birth_name} (${member.code})\n`;
          });
        }

        data = { community, members };
      }
    } else {
      // Get all communities
      const [communities] = await db.execute(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM sisters s WHERE s.current_community_id = c.id) as member_count
         FROM communities c
         ORDER BY c.name`
      );

      contextText = `🏠 Danh sách các cộng đoàn:\n\n`;
      contextText += `Tổng số: ${communities.length} cộng đoàn\n\n`;

      communities.forEach((community) => {
        contextText += `📍 ${community.name}\n`;
        contextText += `   - Mã: ${community.code}\n`;
        contextText += `   - Địa chỉ: ${community.address || "N/A"}\n`;
        contextText += `   - Số thành viên: ${community.member_count}\n\n`;
      });

      data = { communities };
    }

    return { text: contextText, data, sources: [] };
  }

  /**
   * Get statistics context
   */
  async getStatisticsContext(entities) {
    const [[totalSisters]] = await db.execute(
      "SELECT COUNT(*) as count FROM sisters"
    );

    const [[totalCommunities]] = await db.execute(
      "SELECT COUNT(*) as count FROM communities"
    );

    const [byStage] = await db.execute(
      `SELECT js.name as stage_name, COUNT(DISTINCT vj.sister_id) as count
       FROM journey_stages js
       LEFT JOIN vocation_journey vj ON js.code = vj.stage AND vj.end_date IS NULL
       GROUP BY js.id, js.name
       ORDER BY js.display_order`
    );

    const [recentJourneys] = await db.execute(
      `SELECT vj.*, s.birth_name, s.saint_name, js.name as stage_name
       FROM vocation_journey vj
       JOIN sisters s ON vj.sister_id = s.id
       LEFT JOIN journey_stages js ON vj.stage = js.code
       ORDER BY vj.created_at DESC
       LIMIT 5`
    );

    let contextText = `📊 Thống kê tổng quan hệ thống:\n\n`;
    contextText += `👥 Tổng số nữ tu: ${totalSisters.count}\n`;
    contextText += `🏠 Tổng số cộng đoàn: ${totalCommunities.count}\n\n`;

    contextText += `📍 Phân bổ theo giai đoạn ơn gọi:\n`;
    byStage.forEach((stage) => {
      contextText += `- ${stage.stage_name}: ${stage.count || 0} nữ tu\n`;
    });

    if (recentJourneys.length > 0) {
      contextText += `\n📝 Cập nhật hành trình gần đây:\n`;
      recentJourneys.forEach((journey) => {
        const date = new Date(journey.created_at).toLocaleDateString("vi-VN");
        contextText += `- ${date}: ${journey.saint_name || ""} ${journey.birth_name} → ${journey.stage_name || journey.stage}\n`;
      });
    }

    return {
      text: contextText,
      data: {
        totalSisters: totalSisters.count,
        totalCommunities: totalCommunities.count,
        byStage,
        recentJourneys,
      },
      sources: [],
    };
  }

  /**
   * Get education context
   */
  async getEducationContext(entities) {
    let contextText = "";
    let data = {};

    if (entities.sister_id) {
      const [educations] = await db.execute(
        `SELECT e.*, s.birth_name, s.saint_name
         FROM education e
         JOIN sisters s ON e.sister_id = s.id
         WHERE e.sister_id = ?
         ORDER BY e.start_date DESC`,
        [entities.sister_id]
      );

      if (educations.length > 0) {
        contextText = `📚 Học vấn của ${educations[0].saint_name || ""} ${educations[0].birth_name}:\n\n`;
        educations.forEach((edu, index) => {
          contextText += `${index + 1}. ${edu.degree || edu.level}\n`;
          contextText += `   - Chuyên ngành: ${edu.major || edu.field || "N/A"}\n`;
          contextText += `   - Trường: ${edu.institution}\n`;
          contextText += `   - Thời gian: ${edu.start_date ? new Date(edu.start_date).toLocaleDateString('vi-VN') : 'N/A'} - ${edu.end_date ? new Date(edu.end_date).toLocaleDateString('vi-VN') : 'N/A'}\n`;
        });
      } else {
        contextText = "Chưa có thông tin học vấn.";
      }

      data = { educations };
    } else {
      // General education statistics
      const [stats] = await db.execute(
        `SELECT degree, COUNT(*) as count
         FROM education
         GROUP BY degree
         ORDER BY count DESC`
      );

      contextText = `📚 Thống kê học vấn:\n\n`;
      stats.forEach((stat) => {
        contextText += `- ${stat.degree || "Khác"}: ${stat.count} người\n`;
      });

      data = { stats };
    }

    return { text: contextText, data, sources: [] };
  }

  /**
   * Get help context
   */
  getHelpContext() {
    const contextText = `🤖 Hướng dẫn sử dụng trợ lý AI:

Bạn có thể hỏi tôi về:

1. 👤 Thông tin nữ tu:
   - "Cho tôi thông tin về chị Maria"
   - "Hồ sơ của nữ tu có mã NT001"

2. 📍 Hành trình ơn gọi:
   - "Hành trình ơn gọi của chị Maria"
   - "Ai đang ở giai đoạn nhà tập?"
   - "Thống kê các giai đoạn ơn gọi"

3. 🏠 Cộng đoàn:
   - "Danh sách các cộng đoàn"
   - "Thông tin cộng đoàn Thiện Bản"
   - "Ai đang ở cộng đoàn nào?"

4. 📊 Thống kê:
   - "Tổng số nữ tu"
   - "Thống kê chung"
   - "Báo cáo tổng quan"

5. 📚 Học vấn:
   - "Học vấn của chị Maria"
   - "Thống kê trình độ học vấn"

💡 Mẹo: Bạn có thể đặt câu hỏi bằng ngôn ngữ tự nhiên!`;

    return {
      text: contextText,
      data: {},
      sources: [],
    };
  }

  /**
   * Get general context
   */
  async getGeneralContext() {
    const [[totalSisters]] = await db.execute(
      "SELECT COUNT(*) as count FROM sisters"
    );

    const [[totalCommunities]] = await db.execute(
      "SELECT COUNT(*) as count FROM communities"
    );

    const contextText = `📋 Thông tin hệ thống:
- Tổng số nữ tu: ${totalSisters.count}
- Tổng số cộng đoàn: ${totalCommunities.count}

Bạn có thể hỏi tôi về thông tin nữ tu, hành trình ơn gọi, cộng đoàn, thống kê, và nhiều nội dung khác.`;

    return {
      text: contextText,
      data: { totalSisters: totalSisters.count, totalCommunities: totalCommunities.count },
      sources: [],
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    cache.flushAll();
  }
}

module.exports = new ChatbotService();
