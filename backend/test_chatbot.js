// Test chatbot API
require("dotenv").config();
const http = require("http");

// First login to get token
const loginData = JSON.stringify({
  username: "admin",
  password: "password123"
});

const loginOptions = {
  hostname: "localhost",
  port: 5000,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(loginData)
  }
};

console.log("Step 1: Logging in...");

const loginReq = http.request(loginOptions, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Login response:", res.statusCode);
    console.log("Full response:", body);
    
    if (res.statusCode !== 200) {
      console.log("Login failed:", body);
      process.exit(1);
    }
    
    const loginResult = JSON.parse(body);
    const token = loginResult.token || loginResult.data?.token || loginResult.accessToken;
    console.log("Got token:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
    
    // Now test chatbot
    testChatbot(token);
  });
});

loginReq.on("error", (e) => {
  console.log("Login error:", e.message);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();

function testChatbot(token) {
  console.log("\nStep 2: Testing chatbot...");
  
  const chatData = JSON.stringify({
    message: "xin chào"
  });
  
  const chatOptions = {
    hostname: "localhost",
    port: 5000,
    path: "/api/chatbot/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(chatData),
      "Authorization": `Bearer ${token}`
    }
  };
  
  const chatReq = http.request(chatOptions, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Chatbot response status:", res.statusCode);
      console.log("Response body:", body);
      
      if (res.statusCode === 200) {
        const result = JSON.parse(body);
        console.log("\n✅ SUCCESS!");
        console.log("AI Response:", result.response?.substring(0, 200) + "...");
      } else {
        console.log("\n❌ FAILED!");
      }
      
      process.exit(0);
    });
  });
  
  chatReq.on("error", (e) => {
    console.log("Chatbot error:", e.message);
    process.exit(1);
  });
  
  chatReq.write(chatData);
  chatReq.end();
}
