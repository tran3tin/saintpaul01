import React, { useState } from "react";
import Header from "@components/common/Header/Header";
import Sidebar from "@components/common/Sidebar/Sidebar";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCompact={isCompact}
        onToggleCompact={toggleCompact}
      />
      <div className={`main-wrapper ${isCompact ? "sidebar-compact" : ""}`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="p-4">
          <h1>Demo Header & Sidebar</h1>
          <p>Header và Sidebar đang hiển thị</p>
        </div>
      </div>
    </div>
  );
};

export default App;
