import React from "react";
import ReactDOM from "react-dom/client";

// ===== FORCE CLEAR ALL AUTH DATA =====
// This runs BEFORE React loads
console.log("🔧 Checking localStorage...");
const userData = localStorage.getItem("user");
console.log("📦 Current user data:", userData);

// ALWAYS clear if data looks like form credentials
if (userData) {
  try {
    const parsed = JSON.parse(userData);
    console.log("📦 Parsed user:", parsed);
    if (parsed.password !== undefined) {
      console.log("❌ Found password field - this is form data, not user data!");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("✅ Cleared corrupted data!");
      // Force page reload to get clean state
      window.location.reload();
    }
  } catch (e) {
    console.log("❌ Parse error, clearing...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}
// ===== END FORCE CLEAR =====

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

// Feature styles
import "./features/nu-tu/styles/sister.css";

// App
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
