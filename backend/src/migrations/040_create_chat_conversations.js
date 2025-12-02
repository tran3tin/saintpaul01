// migrations/040_create_chat_conversations.js

const db = require("../config/database");

const up = async () => {
  console.log("Running migration: Create chat_conversations table...");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id VARCHAR(36) NOT NULL,
      user_id INT,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      context_used JSON,
      entities_extracted JSON,
      intent VARCHAR(50),
      tokens_used INT DEFAULT 0,
      cost DECIMAL(10, 6) DEFAULT 0,
      is_helpful BOOLEAN,
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_conversation_id (conversation_id),
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await db.execute(createTableQuery);
    console.log("✅ chat_conversations table created successfully");
  } catch (error) {
    console.error("❌ Error creating chat_conversations table:", error.message);
    throw error;
  }
};

const down = async () => {
  console.log("Rolling back migration: Drop chat_conversations table...");

  try {
    await db.execute("DROP TABLE IF EXISTS chat_conversations");
    console.log("✅ chat_conversations table dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping chat_conversations table:", error.message);
    throw error;
  }
};

module.exports = { up, down };
