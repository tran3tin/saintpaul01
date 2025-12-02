// Test chatbot service directly without HTTP
require("dotenv").config();

const chatbotService = require("./src/services/chatbotService");
const geminiService = require("./src/services/geminiService");

async function test() {
  const message = "cho tôi thông tin về trần tín 1";
  
  console.log("1. Analyzing message...");
  const analysis = chatbotService.analyzeMessage(message);
  console.log("   Intent:", analysis.intent);
  
  console.log("\n2. Extracting entities...");
  const entities = await chatbotService.extractEntities(message);
  console.log("   Entities:", entities);
  
  // Auto-adjust intent
  if (entities.sister_id && analysis.intent === "general") {
    analysis.intent = "sister_info";
    console.log("   Intent adjusted to:", analysis.intent);
  }
  
  console.log("\n3. Retrieving context...");
  const context = await chatbotService.retrieveContext(analysis, entities);
  console.log("   Context text:\n", context.text);
  
  console.log("\n4. Calling Gemini...");
  const response = await geminiService.chat(message, context, []);
  console.log("   AI Response:", response.message?.substring(0, 500) + "...");
  
  process.exit(0);
}

test().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
