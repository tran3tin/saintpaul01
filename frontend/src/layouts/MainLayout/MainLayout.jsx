// src/layouts/MainLayout/MainLayout.jsx

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/common/Header";
import Sidebar from "@components/common/Sidebar";
import Footer from "@components/common/Footer";
import "./MainLayout.css";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ← THÊM: Compact mode state
  const [isCompact, setIsCompact] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem("sidebarCompact");
    return saved === "true";
  });

  // ← THÊM: Save compact state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCompact", isCompact);
  }, [isCompact]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ← THÊM: Toggle compact mode
  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };

  return (
    <div className="main-layout">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="layout-container">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCompact={isCompact}
          onToggleCompact={toggleCompact}
        />

        <main className={`main-content ${isCompact ? "compact-mode" : ""}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
