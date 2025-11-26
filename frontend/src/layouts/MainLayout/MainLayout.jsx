// src/layouts/MainLayout/MainLayout.jsx

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/common/Header";
import Sidebar from "@components/common/Sidebar";
import Footer from "@components/common/Footer";
import "./MainLayout.css";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="main-layout">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="layout-container">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="main-content">
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
