// config/config.js

require("dotenv").config();

module.exports = {
  // ... existing config

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    model: process.env.OPENAI_MODEL || "gpt-4",
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,

    pricing: {
      "gpt-4": {
        input: 0.03,
        output: 0.06,
      },
      "gpt-3.5-turbo": {
        input: 0.0015,
        output: 0.002,
      },
    },
  },
};
