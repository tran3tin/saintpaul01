import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

// App
import App from "./App";

// Simple Auth Provider for demo
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const mockUser = {
    full_name: "Admin",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
  };

  const value = {
    user: mockUser,
    logout: async () => console.log("Logout clicked"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
