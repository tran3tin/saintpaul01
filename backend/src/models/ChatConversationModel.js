// models/ChatConversationModel.js

const db = require("../config/database");

class ChatConversationModel {
  /**
   * Create new conversation record
   */
  static async create(data) {
    const query = `
      INSERT INTO chat_conversations 
      (conversation_id, user_id, user_message, ai_response, context_used, 
       entities_extracted, intent, tokens_used, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.conversation_id,
      data.user_id || null,
      data.user_message,
      data.ai_response,
      JSON.stringify(data.context_used || {}),
      JSON.stringify(data.entities_extracted || {}),
      data.intent || null,
      data.tokens_used || 0,
      data.cost || 0,
    ];

    const [result] = await db.execute(query, values);
    return {
      id: result.insertId,
      ...data,
    };
  }

  /**
   * Get conversation by ID
   */
  static async getById(id) {
    const query = "SELECT * FROM chat_conversations WHERE id = ?";
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Get conversation history by conversation_id
   */
  static async getByConversationId(conversationId, limit = 10) {
    const query = `
      SELECT * FROM chat_conversations
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [conversationId, limit]);
    return rows.reverse(); // Return oldest first for context
  }

  /**
   * Get recent conversations by user
   */
  static async getByUserId(userId, limit = 50) {
    const query = `
      SELECT * FROM chat_conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [userId, limit]);
    return rows;
  }

  /**
   * Get unique conversations by user (grouped by conversation_id)
   */
  static async getConversationsByUser(userId, limit = 20) {
    const query = `
      SELECT 
        conversation_id,
        MIN(created_at) as started_at,
        MAX(created_at) as last_message_at,
        COUNT(*) as message_count,
        SUBSTRING(MIN(user_message), 1, 100) as first_message
      FROM chat_conversations
      WHERE user_id = ?
      GROUP BY conversation_id
      ORDER BY last_message_at DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [userId, limit]);
    return rows;
  }

  /**
   * Delete conversation by conversation_id
   */
  static async deleteByConversationId(conversationId) {
    const query = "DELETE FROM chat_conversations WHERE conversation_id = ?";
    const [result] = await db.execute(query, [conversationId]);
    return result.affectedRows > 0;
  }

  /**
   * Update feedback for a message
   */
  static async updateFeedback(id, isHelpful, feedback = null) {
    const query = `
      UPDATE chat_conversations 
      SET is_helpful = ?, feedback = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [isHelpful, feedback, id]);
    return result.affectedRows > 0;
  }

  /**
   * Get usage statistics by user
   */
  static async getUserStats(userId, days = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        SUM(tokens_used) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(DISTINCT conversation_id) as total_conversations,
        AVG(CASE WHEN is_helpful = 1 THEN 1 WHEN is_helpful = 0 THEN 0 END) as helpful_rate
      FROM chat_conversations
      WHERE user_id = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const [rows] = await db.execute(query, [userId, days]);
    return rows[0];
  }

  /**
   * Get global statistics (admin)
   */
  static async getGlobalStats(days = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT conversation_id) as total_conversations,
        SUM(tokens_used) as total_tokens,
        SUM(cost) as total_cost,
        AVG(CASE WHEN is_helpful = 1 THEN 1 WHEN is_helpful = 0 THEN 0 END) as helpful_rate
      FROM chat_conversations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const [rows] = await db.execute(query, [days]);
    return rows[0];
  }

  /**
   * Get popular intents
   */
  static async getPopularIntents(days = 30, limit = 10) {
    const query = `
      SELECT 
        intent,
        COUNT(*) as count
      FROM chat_conversations
      WHERE intent IS NOT NULL
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY intent
      ORDER BY count DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [days, limit]);
    return rows;
  }

  /**
   * Search conversations
   */
  static async search(searchTerm, userId = null, limit = 50) {
    let query = `
      SELECT * FROM chat_conversations
      WHERE (user_message LIKE ? OR ai_response LIKE ?)
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Clean old conversations (for maintenance)
   */
  static async cleanOldConversations(days = 90) {
    const query = `
      DELETE FROM chat_conversations 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const [result] = await db.execute(query, [days]);
    return result.affectedRows;
  }
}

module.exports = ChatConversationModel;
