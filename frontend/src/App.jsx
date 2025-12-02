// src/App.jsx

import React from "react";
import { BrowserRouter } from "react-router-dom";

// Contexts
import { AuthProvider, NotificationProvider, SidebarProvider } from "@context";

// Components
import { ChatbotWidget } from "@components/Chatbot";

// Routes
import AppRoutes from "./routes";

// Styles
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SidebarProvider>
            <AppRoutes />
            <ChatbotWidget />
          </SidebarProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
